import { transaction } from "./transaction";
import type { Booking, BookingEvent, BookingPolicy, BookingRequest, BookingService, UserRole } from "./contracts";
import { getMockUser, mockParkingService, readDemo, writeDemo, type DemoState } from "./mock";

/** Illustrative rules only; replace with university-approved server policies later. */
export const demoBookingPolicies: Record<UserRole, BookingPolicy> = {
  student: { role: "student", maxActiveBookings: 1, maxMinutes: 60, advanceHours: 24 },
  staff: { role: "staff", maxActiveBookings: 2, maxMinutes: 120, advanceHours: 48 },
  lecturer: { role: "lecturer", maxActiveBookings: 2, maxMinutes: 180, advanceHours: 72 },
  admin: { role: "admin", maxActiveBookings: 2, maxMinutes: 180, advanceHours: 72 },
};
const overlaps = (a: number, b: number, c: number, d: number) => a < d && c < b;
function eventFor(booking: Booking, type: BookingEvent["type"], at: number): BookingEvent {
  return { id: `${booking.id}-${type}`, bookingId: booking.id, userId: booking.userId, slotId: booking.slotId, type, timestamp: new Date(at).toISOString() };
}
function reconcile(now: number, persist = false): DemoState {
  const saved = readDemo();
  const state = { ...saved, events: [...saved.events] };
  let changed = false;
  state.bookings = state.bookings.map(booking => {
    if (booking.status !== "confirmed" || Date.parse(booking.expiresAt) > now) return booking;
    changed = true;
    state.events.push(eventFor(booking, "expired", Date.parse(booking.expiresAt)));
    return { ...booking, status: "expired" };
  });
  if (changed && persist) writeDemo(state);
  return state;
}
function interval(request: Pick<BookingRequest, "startsAt" | "durationMinutes">, now: number) {
  const start = request.startsAt === null ? now : Date.parse(request.startsAt);
  if (!Number.isFinite(start) || start < now) throw new Error("เวลาเริ่มต้องไม่อยู่ในอดีต กรุณาเลือกเวลาใหม่");
  if (!Number.isInteger(request.durationMinutes) || request.durationMinutes < 5 || request.durationMinutes > 180) throw new Error("ระยะเวลาจองต้องเป็นจำนวนเต็ม 5–180 นาที");
  return { start, end: start + request.durationMinutes * 60_000 };
}
function session(state: DemoState, userId: string) {
  const user = state.accountId === userId ? getMockUser(state, userId) : undefined;
  if (!user) throw new Error("บัญชีเปลี่ยนหรือยังไม่ได้เข้าสู่ระบบ กรุณาเลือกบัญชีแล้วลองใหม่");
  return user;
}
export function createMockBookingService(clock: () => number = Date.now): BookingService {
  async function available(request: Pick<BookingRequest, "zoneId" | "vehicleType" | "startsAt" | "durationMinutes">, now: number) {
    if (!["car", "motorcycle"].includes(request.vehicleType)) throw new Error("ประเภทรถไม่ถูกต้อง");
    const { start, end } = interval(request, now);
    const slots = await mockParkingService.getDetails(request.zoneId);
    const state = reconcile(now);
    return slots.filter(slot => slot.hasData && slot[request.vehicleType].free > 0 &&
      !state.bookings.some(b => b.status === "confirmed" && b.slotId === slot.id &&
        overlaps(start, end, Date.parse(b.startsAt), Date.parse(b.expiresAt)))).map(slot => slot.id);
  }
  return {
    getPolicy(role) { return { ...demoBookingPolicies[role] }; },
    async getAvailableSlots(request) { return available(request, clock()); },
    getSnapshot() {
      return transaction(async () => {
      const now = clock();
      const zones = await mockParkingService.listZones();
      const details = await Promise.all(zones.map(zone => mockParkingService.getDetails(zone.id)));
      const state = reconcile(now, true);
      const current = state.bookings.filter(b => b.status === "confirmed" && Date.parse(b.startsAt) <= now && now < Date.parse(b.expiresAt));
      return {
        bookings: state.bookings.filter(b => b.userId === state.accountId).map(b => ({ ...b })),
        events: state.events.filter(e => e.userId === state.accountId).map(e => ({ ...e })),
        availability: zones.map((zone, i) => {
          const reservedSlotIds = [...new Set(current.filter(b => b.zoneId === zone.id).map(b => b.slotId))];
          // A booked slot which becomes occupied must not be subtracted twice.
          const free = details[i].filter(slot => slot.free > 0 && !reservedSlotIds.includes(slot.id));
          return { zoneId: zone.id, reserved: reservedSlotIds.length, reservedSlotIds,
            bookable: free.length, carBookable: free.filter(s => s.car.free > 0).length,
            motorcycleBookable: free.filter(s => s.motorcycle.free > 0).length };
        }),
      };
      });
    },
    create(request) {
      return transaction(async () => {
        const now = clock();
        const { start, end } = interval(request, now);
        const slots = await available(request, now);
        // Read the latest session and ledger after asynchronous data access.
        const state = reconcile(now, true);
        const user = session(state, request.userId);
        const policy = demoBookingPolicies[user.role];
        if (request.durationMinutes > policy.maxMinutes) throw new Error(`บทบาทนี้จองได้ครั้งละไม่เกิน ${policy.maxMinutes} นาที`);
        if (start > now + policy.advanceHours * 3_600_000) throw new Error(`จองล่วงหน้าได้ไม่เกิน ${policy.advanceHours} ชั่วโมง`);
        const mine = state.bookings.filter(b => b.userId === user.id && b.status === "confirmed");
        if (mine.some(b => overlaps(start, end, Date.parse(b.startsAt), Date.parse(b.expiresAt)))) throw new Error("คุณมีการจองในช่วงเวลานี้แล้ว");
        if (mine.length >= policy.maxActiveBookings) throw new Error(`มีการจองที่ยังไม่สิ้นสุดได้สูงสุด ${policy.maxActiveBookings} รายการ`);
        if (!slots.length) throw new Error("ไม่มีช่องพร้อมจองสำหรับรถและช่วงเวลาที่เลือก");
        const booking: Booking = {
          id: `booking-${now}-${Math.random().toString(36).slice(2, 10)}`, userId: user.id,
          zoneId: request.zoneId.toUpperCase(), slotId: slots[0], vehicleType: request.vehicleType,
          startsAt: new Date(start).toISOString(), expiresAt: new Date(end).toISOString(), createdAt: new Date(now).toISOString(), status: "confirmed",
        };
        state.bookings.push(booking);
        state.events.push(eventFor(booking, "created", now));
        writeDemo(state);
        return { ...booking };
      });
    },
    cancel(bookingId, userId) {
      return transaction(async () => {
        const now = clock();
        const state = reconcile(now, true);
        const user = session(state, userId);
        const booking = state.bookings.find(b => b.id === bookingId && b.userId === user.id);
        if (!booking) throw new Error("ไม่พบการจองของบัญชีนี้");
        if (booking.status !== "confirmed") throw new Error("การจองนี้ยกเลิกหรือหมดอายุแล้ว");
        booking.status = "cancelled";
        state.events.push(eventFor(booking, "cancelled", now));
        writeDemo(state);
      });
    },
  };
}
export const mockBookingService = createMockBookingService();

