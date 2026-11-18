import type { AppNotification, BookingService, NotificationService } from "./contracts";
import { createMockBookingService } from "./booking";
import { readDemo, writeDemo, mockParkingService, getMockUser } from "./mock";
import { transaction } from "./transaction";
import { getParkingStatus } from "@/lib/occupancy";
import { zoneCatalog } from "./catalog";

function requireSession(userId: string) {
  const state = readDemo();
  if (state.accountId !== userId || !getMockUser(state, userId)) throw new Error("บัญชีเปลี่ยนหรือยังไม่ได้เข้าสู่ระบบ กรุณาเลือกบัญชีแล้วลองใหม่");
  return state;
}
export function createMockNotificationService(clock: () => number = Date.now, booking: BookingService = createMockBookingService(clock)): NotificationService {
  return {
    async getSnapshot() {
      // Reconcile booking expiry before acquiring the same ledger lock (no nested locks).
      await booking.getSnapshot();
      return transaction(async () => {
        const zones = await mockParkingService.listZones();
        const details = await Promise.all(zones.map(zone => mockParkingService.getDetails(zone.id)));
        const state = readDemo();
        const now = clock();
        let changed = false;
        const known = new Set(state.notifications.map(n => n.id));
        function add(notification: Omit<AppNotification, "readAt">) {
          if (known.has(notification.id)) return;
          known.add(notification.id);
          state.notifications.push({ ...notification, readAt: null });
          changed = true;
        }
        for (const event of state.events) {
          const b = state.bookings.find(b => b.id === event.bookingId);
          if (!b) continue;
          const title = event.type === "created" ? "จองที่จอดสำเร็จ" : event.type === "cancelled" ? "ยกเลิกการจองแล้ว" : "การจองหมดอายุแล้ว";
          add({ id: `notification-${event.id}`, userId: event.userId, type: `booking-${event.type}`, title,
            body: `${event.slotId} • ${event.type === "created" ? "ดูช่วงเวลาที่จองได้ใน My Booking" : "สิ้นสุดการกันช่องสำหรับการจองนี้แล้ว"}`,
            createdAt: event.timestamp, bookingId: b.id, zoneId: b.zoneId });
        }
        for (const b of state.bookings) {
          const end = Date.parse(b.expiresAt);
          if (b.status !== "confirmed" || Date.parse(b.startsAt) > now || end <= now || end - now > 300_000) continue;
          add({ id: `notification-${b.id}-ending`, userId: b.userId, type: "booking-ending", title: "การจองเหลือเวลาไม่เกิน 5 นาที",
            body: `${b.slotId} • ตรวจเวลาที่เหลือได้ใน My Booking`, createdAt: new Date(Math.max(Date.parse(b.startsAt), end - 300_000)).toISOString(), bookingId: b.id, zoneId: b.zoneId });
        }
        for (const watch of state.watches) {
          const zone = zones.find(z => z.id === watch.zoneId);
          const slots = details[zones.findIndex(z => z.id === watch.zoneId)] ?? [];
          const reserved = new Set(state.bookings.filter(b => b.status === "confirmed" && Date.parse(b.startsAt) <= now && now < Date.parse(b.expiresAt)).map(b => b.slotId));
          const bookable = slots.filter(slot => slot.free > 0 && !reserved.has(slot.id)).length;
          // An unavailable feed is not a recovery; do not re-alert on the same status after reconnect.
          if (!zone?.hasData) continue;
          const status = getParkingStatus(true, zone.total - bookable, zone.total);
          if (status === "no-data" || status === watch.lastStatus) continue;
          watch.lastStatus = status; changed = true;
          if (status === "available") continue;
          add({ id: `zone-${watch.userId}-${watch.zoneId}-${now}-${state.notifications.length}`, userId: watch.userId,
            type: status === "full" ? "zone-full" : "zone-nearly-full", title: `โซน ${watch.zoneId} ${status === "full" ? "เต็มแล้ว" : "ใกล้เต็ม"}`,
            body: `พร้อมจองตอนนี้ ${bookable} จาก ${zone.total} ช่อง (รวมผลการจองปัจจุบัน)`, createdAt: new Date(now).toISOString(), zoneId: watch.zoneId });
        }
        if (changed) writeDemo(state);
        return {
          userId: state.accountId,
          notifications: state.notifications.filter(n => n.userId === state.accountId).map(n => ({ ...n })).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
          followedZoneIds: state.watches.filter(w => w.userId === state.accountId).map(w => w.zoneId),
        };
      });
    },
    markRead(id, userId) {
      return transaction(async () => {
        const state = requireSession(userId);
        const notification = state.notifications.find(n => n.id === id && n.userId === userId);
        if (!notification) throw new Error("ไม่พบข้อความแจ้งเตือนของบัญชีนี้");
        if (notification.readAt === null) { notification.readAt = new Date(clock()).toISOString(); writeDemo(state); }
      });
    },
    markAllRead(userId) {
      return transaction(async () => {
        const state = requireSession(userId);
        let changed = false;
        for (const n of state.notifications) if (n.userId === userId && n.readAt === null) { n.readAt = new Date(clock()).toISOString(); changed = true; }
        if (changed) writeDemo(state);
      });
    },
    followZone(zoneId, follow, userId) {
      return transaction(async () => {
        const state = requireSession(userId);
        const normalized = zoneId.toUpperCase();
        if (!zoneCatalog.some(z => z.id === normalized)) throw new Error("ไม่พบโซนนี้");
        const existing = state.watches.some(w => w.userId === userId && w.zoneId === normalized);
        if (follow === existing) return;
        if (follow) state.watches.push({ userId, zoneId: normalized, lastStatus: null });
        else state.watches = state.watches.filter(w => w.userId !== userId || w.zoneId !== normalized);
        writeDemo(state);
      });
    },
  };
}
export const mockNotificationService = createMockNotificationService();
