"use client";
import { useApp } from "@/components/providers/app-provider";
import { bookingEnabled } from "@/lib/services";

export function BookingAvailabilityPanel({ zoneId }: { zoneId?: string }) {
  const { bookingSnapshot, loading, bookingError } = useApp();
  if (!bookingEnabled || loading) return null;
  if (bookingError) return <p role="alert">{bookingError}</p>;
  const items = bookingSnapshot.availability.filter(item => !zoneId || item.zoneId === zoneId);
  const sum = (field: "reserved" | "bookable" | "carBookable" | "motorcycleBookable") => items.reduce((n, item) => n + item[field], 0);
  return <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
    <p>จองในช่วงปัจจุบัน <strong>{sum("reserved")}</strong> ช่อง • พร้อมจองตอนนี้ <strong>{sum("bookable")}</strong> ช่อง</p>
    <p className="mt-1 text-xs">พร้อมจอง: รถยนต์ {sum("carBookable")} / มอเตอร์ไซค์ {sum("motorcycleBookable")}</p>
    <p className="mt-1 text-xs">การจองแยกจากจำนวนรถจอดอยู่ • ช่วงเวลาล่วงหน้าตรวจได้ในหน้าจอง</p>
  </div>;
}
export function SlotReservationBadge({ slotId }: { slotId: string }) {
  const { bookingSnapshot } = useApp();
  if (!bookingEnabled) return null;
  const reserved = bookingSnapshot.availability.some(item => item.reservedSlotIds.includes(slotId));
  return reserved ? <p className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950">ถูกจองในช่วงเวลาปัจจุบัน</p> : null;
}
