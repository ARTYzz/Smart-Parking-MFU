import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Load TypeScript services without changing the app's module configuration.
function harness(storageFails = false, storage = new Map(), navigator = undefined) {
  const cache = new Map();
  const localStorage = {
    getItem: key => { if (storageFails) throw Error('blocked'); return storage.get(key) ?? null; },
    setItem: (key, value) => { if (storageFails) throw Error('blocked'); storage.set(key, value); },
  };
  function load(file) {
    file = path.resolve(file);
    if (cache.has(file)) return cache.get(file).exports;
    const compiledModule = { exports: {} };
    cache.set(file, compiledModule);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const requireLocal = name => load((name.startsWith('@/') ? path.resolve(name.slice(2)) : path.resolve(path.dirname(file), name)) + '.ts');
    vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { window: {}, localStorage, console, navigator })(requireLocal, compiledModule, compiledModule.exports);
    return compiledModule.exports;
  }
  return { service: load('lib/services/mock.ts'), bookingModule: load('lib/services/booking.ts'), notificationModule: load('lib/services/notifications.ts'), storage };
}

test('all seven zones agree with their individual slots in every scenario', async () => {
  const { service } = harness();
  for (const scenario of ['normal', 'full', 'no-data']) {
    service.setDemoScenario(scenario);
    const zones = await service.mockParkingService.listZones();
    assert.equal(zones.length, 7);
    for (const zone of zones) {
      const slots = await service.mockParkingService.getDetails(zone.id.toLowerCase());
      assert.equal(slots.length, zone.total);
      assert.equal(slots.reduce((n, slot) => n + slot.free, 0), zone.free);
      assert.equal(slots.reduce((n, slot) => n + slot.occupied, 0), zone.occupied);
      for (const vehicle of ['car', 'motorcycle']) {
        assert.equal(slots.reduce((n, slot) => n + slot[vehicle].free, 0), zone[vehicle].free);
      }
      if (scenario === 'full') assert.equal(zone.status, 'full');
      if (scenario === 'no-data') assert.equal(zone.status, 'no-data');
    }
  }
  assert.equal((await service.mockParkingService.getDetails('unknown')).length, 0);
});
test('demo session switching, sign-out, reset and invalid account rejection', async () => {
  const { service, storage } = harness();
  for (const account of service.demoAccounts) {
    await service.mockAuthService.signIn(account.id);
    assert.equal((await service.mockAuthService.getSession()).role, account.role);
    assert.equal(JSON.parse(storage.get(service.demoStorageKey)).accountId, account.id);
  }
  await assert.rejects(() => service.mockAuthService.signIn('real-user'));
  await service.mockAuthService.signOut();
  assert.equal(await service.mockAuthService.getSession(), null);
  service.setDemoScenario('full');
  service.resetDemo();
  assert.equal(JSON.parse(storage.get(service.demoStorageKey)).scenario, 'normal');
  assert.equal(await service.mockAuthService.getSession(), null);
});
test('storage failures and corrupt saved state remain usable', async () => {
  const blocked = harness(true).service;
  await blocked.mockAuthService.signIn('demo-student');
  assert.equal((await blocked.mockAuthService.getSession()).role, 'student');
  const { service, storage } = harness();
  storage.set(service.demoStorageKey, '{bad-json');
  assert.equal((await service.mockParkingService.listZones()).length, 7);
});

const baseTime = Date.parse('2026-09-09T08:00:00+07:00');
function bookingHarness() {
  const h = harness();
  let now = baseTime;
  const booking = h.bookingModule.createMockBookingService(() => now);
  return { ...h, booking, notifications: h.notificationModule.createMockNotificationService(() => now, booking), advance: ms => { now += ms; } };
}
const request = (extra = {}) => ({ userId: 'demo-student', zoneId: 'E1', vehicleType: 'car', startsAt: null, durationMinutes: 15, ...extra });

test('current booking changes bookable count but never physical occupancy; cancel restores inventory', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  const before = (await h.booking.getSnapshot()).availability.find(z => z.zoneId === 'E1');
  const physical = (await h.service.mockParkingService.listZones()).find(z => z.id === 'E1');
  const b = await h.booking.create(request());
  const after = (await h.booking.getSnapshot()).availability.find(z => z.zoneId === 'E1');
  assert.equal(after.bookable, before.bookable - 1);
  assert.equal(after.carBookable, before.carBookable - 1);
  assert.equal(after.reserved, 1);
  assert.equal((await h.service.mockParkingService.listZones()).find(z => z.id === 'E1').occupied, physical.occupied);
  const slot = (await h.service.mockParkingService.getDetails('E1')).find(s => s.id === b.slotId);
  assert.equal(slot.car.free, 1);
  await h.booking.cancel(b.id, 'demo-student');
  const snapshot = await h.booking.getSnapshot();
  assert.equal(snapshot.availability.find(z => z.zoneId === 'E1').bookable, before.bookable);
  assert.equal(snapshot.events.length, 2);
  await assert.rejects(() => h.booking.cancel(b.id, 'demo-student'));
});

test('guest, stale identity, duration, invalid time and advance-window checks', async () => {
  const h = bookingHarness();
  await assert.rejects(() => h.booking.create(request()));
  await h.service.mockAuthService.signIn('demo-student');
  for (const extra of [
    { userId: 'demo-admin' }, { durationMinutes: 120 }, { durationMinutes: 0 }, { durationMinutes: 5.5 },
    { startsAt: 'bad' }, { startsAt: new Date(baseTime - 1).toISOString() },
    { startsAt: new Date(baseTime + 25 * 3600000).toISOString() }, { vehicleType: 'truck' }, { zoneId: 'unknown' },
  ]) await assert.rejects(() => h.booking.create(request(extra)));
  assert.equal((await h.booking.getSnapshot()).bookings.length, 0);
});

test('student quota and personal time overlap are enforced; adjacent staff bookings reuse a slot', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  await h.booking.create(request());
  await assert.rejects(() => h.booking.create(request({ startsAt: new Date(baseTime + 3600000).toISOString() })), /สูงสุด/);
  await h.service.mockAuthService.signIn('demo-staff');
  const startsAt = new Date(baseTime + 3600000).toISOString();
  const first = await h.booking.create(request({ userId: 'demo-staff', startsAt }));
  await assert.rejects(() => h.booking.create(request({ userId: 'demo-staff', startsAt, zoneId: 'C5' })), /ช่วงเวลา/);
  const second = await h.booking.create(request({ userId: 'demo-staff', startsAt: first.expiresAt }));
  assert.equal(second.slotId, first.slotId);
  await assert.rejects(() => h.booking.create(request({ userId: 'demo-staff', startsAt: second.expiresAt })), /สูงสุด/);
});

test('future reservation only blocks its interval, activates on time and expires exactly once', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  const before = (await h.booking.getSnapshot()).availability.find(z => z.zoneId === 'E1').bookable;
  const b = await h.booking.create(request({ startsAt: new Date(baseTime + 3600000).toISOString() }));
  assert.equal((await h.booking.getSnapshot()).availability.find(z => z.zoneId === 'E1').bookable, before);
  assert.equal((await h.booking.getAvailableSlots(request({ startsAt: b.startsAt }))).includes(b.slotId), false);
  assert.equal((await h.booking.getAvailableSlots(request({ startsAt: b.expiresAt }))).includes(b.slotId), true);
  h.advance(3600000);
  assert.equal((await h.booking.getSnapshot()).availability.find(z => z.zoneId === 'E1').bookable, before - 1);
  h.advance(15 * 60000);
  const snapshot = await h.booking.getSnapshot();
  assert.equal(snapshot.bookings[0].status, 'expired');
  assert.equal(snapshot.availability.find(z => z.zoneId === 'E1').bookable, before);
  assert.equal((await h.booking.getSnapshot()).events.filter(e => e.type === 'expired').length, 1);
  await h.booking.create(request()); // expired booking releases quota as well
});

test('bookings and events survive reload, isolate accounts, and reset clears the ledger', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  const b = await h.booking.create(request({ vehicleType: 'motorcycle' }));
  assert.match(b.slotId, /-M/);
  const reloaded = harness(false, h.storage);
  const booking = reloaded.bookingModule.createMockBookingService(() => baseTime);
  assert.equal((await booking.getSnapshot()).bookings[0].id, b.id);
  await reloaded.service.mockAuthService.signIn('demo-staff');
  assert.equal((await booking.getSnapshot()).bookings.length, 0);
  assert.equal((await booking.getSnapshot()).events.length, 0);
  await assert.rejects(() => booking.cancel(b.id, 'demo-staff'));
  await assert.rejects(() => booking.cancel(b.id, 'demo-student'));
  reloaded.service.resetDemo();
  await reloaded.service.mockAuthService.signIn('demo-student');
  assert.equal((await booking.getSnapshot()).bookings.length, 0);
  assert.equal((await booking.getSnapshot()).events.length, 0);
});

test('full/no-data cannot be booked; an occupied reserved slot is not subtracted twice', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  await h.booking.create(request());
  await h.service.mockAuthService.signIn('demo-staff');
  for (const scenario of ['full', 'no-data']) {
    h.service.setDemoScenario(scenario);
    await assert.rejects(() => h.booking.create(request({ userId: 'demo-staff' })), /ไม่มีช่อง/);
    const zone = (await h.booking.getSnapshot()).availability.find(z => z.zoneId === 'E1');
    assert.equal(zone.bookable, 0);
    assert.equal(zone.reserved, 1);
  }
});

test('concurrent double submission is serialized within one tab', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  const results = await Promise.allSettled([h.booking.create(request()), h.booking.create(request())]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await h.booking.getSnapshot()).bookings.length, 1);
});

test('Web Locks serialize competing submissions from separate browser contexts', async () => {
  let pending = Promise.resolve();
  const navigator = { locks: { request: (_name, fn) => { const result = pending.then(fn); pending = result.catch(() => {}); return result; } } };
  const storage = new Map();
  const first = harness(false, storage, navigator);
  const second = harness(false, storage, navigator);
  await first.service.mockAuthService.signIn('demo-student');
  const a = first.bookingModule.createMockBookingService(() => baseTime);
  const b = second.bookingModule.createMockBookingService(() => baseTime);
  const results = await Promise.allSettled([a.create(request()), b.create(request())]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal((await b.getSnapshot()).bookings.length, 1);
});

test('booking notifications are deduplicated, read state survives reload, and cancellation is delivered', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  const booking = await h.booking.create(request());
  const first = await h.notifications.getSnapshot();
  assert.equal(first.notifications.length, 1);
  assert.equal(first.notifications[0].type, 'booking-created');
  await h.notifications.markRead(first.notifications[0].id, 'demo-student');
  const saved = h.storage.get(h.service.demoStorageKey);
  await h.notifications.getSnapshot(); await h.notifications.getSnapshot();
  assert.equal(h.storage.get(h.service.demoStorageKey), saved); // polling doesn't write or re-notify
  const reloaded = harness(false, h.storage);
  const service = reloaded.notificationModule.createMockNotificationService(() => baseTime);
  assert.notEqual((await service.getSnapshot()).notifications[0].readAt, null);
  await h.booking.cancel(booking.id, 'demo-student');
  const after = await service.getSnapshot();
  assert.equal(after.notifications.length, 2);
  assert.equal(after.notifications.filter(n => n.type === 'booking-cancelled').length, 1);
  await service.markAllRead('demo-student');
  assert.equal((await service.getSnapshot()).notifications.filter(n => n.readAt === null).length, 0);
});

test('five-minute reminder fires exactly at threshold, once, and expiry adds a separate message', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  await h.booking.create(request());
  h.advance(10 * 60000 - 1);
  assert.equal((await h.notifications.getSnapshot()).notifications.some(n => n.type === 'booking-ending'), false);
  h.advance(1);
  assert.equal((await h.notifications.getSnapshot()).notifications.filter(n => n.type === 'booking-ending').length, 1);
  h.advance(60000);
  assert.equal((await h.notifications.getSnapshot()).notifications.filter(n => n.type === 'booking-ending').length, 1);
  h.advance(4 * 60000);
  const expired = await h.notifications.getSnapshot();
  assert.equal(expired.notifications.filter(n => n.type === 'booking-expired').length, 1);
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 3);
});

test('no premature future reminder or stale reminder when reopening after expiry', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  await h.booking.create(request({ startsAt: new Date(baseTime + 60000).toISOString(), durationMinutes: 5 }));
  assert.equal((await h.notifications.getSnapshot()).notifications.some(n => n.type === 'booking-ending'), false);
  h.advance(7 * 60000);
  const messages = (await h.notifications.getSnapshot()).notifications;
  assert.equal(messages.some(n => n.type === 'booking-ending'), false);
  assert.equal(messages.some(n => n.type === 'booking-expired'), true);
});

test('zone transitions notify only followers, ignore no-data and repeated status, and can re-alert after recovery', async () => {
  const h = bookingHarness();
  await h.service.mockAuthService.signIn('demo-student');
  await h.notifications.followZone('E1', true, 'demo-student');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 0);
  h.service.setDemoScenario('full');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 1);
  assert.equal((await h.notifications.getSnapshot()).notifications[0].type, 'zone-full');
  h.service.setDemoScenario('no-data'); await h.notifications.getSnapshot();
  h.service.setDemoScenario('full');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 1);
  h.service.setDemoScenario('normal'); await h.notifications.getSnapshot();
  h.service.setDemoScenario('full');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 2);
  await h.notifications.followZone('E1', false, 'demo-student');
  h.service.setDemoScenario('normal'); await h.notifications.getSnapshot();
  h.service.setDemoScenario('full');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 2);
});

test('initial nearly-full follow notifies once, read/follow mutations enforce ownership, reset clears notifications', async () => {
  const h = bookingHarness();
  await assert.rejects(() => h.notifications.followZone('E1', true, 'demo-student'));
  await h.service.mockAuthService.signIn('demo-student');
  await assert.rejects(() => h.notifications.followZone('missing', true, 'demo-student'));
  await h.notifications.followZone('e2', true, 'demo-student');
  const snapshot = await h.notifications.getSnapshot();
  assert.equal(snapshot.notifications[0].type, 'zone-nearly-full');
  assert.equal(snapshot.followedZoneIds[0], 'E2');
  await h.service.mockAuthService.signIn('demo-staff');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 0);
  assert.equal((await h.notifications.getSnapshot()).followedZoneIds.length, 0);
  await assert.rejects(() => h.notifications.markRead(snapshot.notifications[0].id, 'demo-staff'));
  await assert.rejects(() => h.notifications.markAllRead('demo-student'));
  await h.notifications.markAllRead('demo-staff');
  await h.service.mockAuthService.signIn('demo-student');
  assert.equal((await h.notifications.getSnapshot()).notifications[0].readAt, null);
  h.service.resetDemo();
  await h.service.mockAuthService.signIn('demo-student');
  assert.equal((await h.notifications.getSnapshot()).notifications.length, 0);
  assert.equal((await h.notifications.getSnapshot()).followedZoneIds.length, 0);
});

