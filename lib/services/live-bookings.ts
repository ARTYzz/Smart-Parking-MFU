import type { Booking, BookingService, BookingSnapshot, NotificationService, NotificationSnapshot } from "./contracts";
import { demoBookingPolicies } from "./booking";

async function call<T>(action: string, fields?: object): Promise<T> {
  const response = await fetch("/api/bookings", {
    method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ ...fields, action }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? "ระบบจองไม่พร้อมใช้งาน");
  return payload.data as T;
}

export const liveBookingService: BookingService = {
  getPolicy: role => ({ ...demoBookingPolicies[role] }),
  getSnapshot: () => call<BookingSnapshot>("snapshot"),
  getAvailableSlots: request => call<string[]>("available", request),
  create: ({ zoneId, vehicleType, startsAt, durationMinutes, requestId }) => call<Booking>("create", {
    zoneId, vehicleType, startsAt, durationMinutes, requestId: requestId ?? crypto.randomUUID(),
  }),
  cancel: bookingId => call<void>("cancel", { bookingId }),
};

export const liveNotificationService: NotificationService = {
  getSnapshot: () => call<NotificationSnapshot>("notifications"),
  markRead: id => call<void>("mark-read", { id }),
  markAllRead: () => call<void>("mark-all-read"),
  followZone: (zoneId, follow) => call<void>("watch", { zoneId, follow }),
};
