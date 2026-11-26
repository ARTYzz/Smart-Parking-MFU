"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { useApp } from "@/components/providers/app-provider";

export function BookingAvailabilityPanel({ zoneId }: { zoneId?: string }) {
  const { t } = useLanguage();
  const { bookingSnapshot, loading, bookingError } = useApp();
  if (loading) return null;
  if (bookingError) return <p role="alert">{t(bookingError)}</p>;
  const items = bookingSnapshot.availability.filter(item => !zoneId || item.zoneId === zoneId);
  const sum = (field: "reserved" | "bookable" | "carBookable" | "motorcycleBookable") => items.reduce((n, item) => n + item[field], 0);
  return <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
    <p>{t("จองในช่วงปัจจุบัน ")}<strong>{t(sum("reserved"))}</strong>{t(" ช่อง • พร้อมจองตอนนี้ ")}<strong>{t(sum("bookable"))}</strong>{t(" ช่อง")}</p>
    <p className="mt-1 text-xs">{t("พร้อมจอง: รถยนต์ ")}{t(sum("carBookable"))}{t(" / มอเตอร์ไซค์ ")}{t(sum("motorcycleBookable"))}</p>
    <p className="mt-1 text-xs">{t("การจองแยกจากจำนวนรถจอดอยู่ • ช่วงเวลาล่วงหน้าตรวจได้ในหน้าจอง")}</p>
  </div>;
}
export function SlotReservationBadge({ slotId, zoneId }: { slotId: string; zoneId: string }) {
  const { t } = useLanguage();
  const { bookingSnapshot } = useApp();
  const reserved = bookingSnapshot.availability.some(item => item.zoneId === zoneId && item.reservedSlotIds.includes(slotId));
  return reserved ? <p className="mt-3 rounded-xl bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-950">{t("ถูกจองในช่วงเวลาปัจจุบัน")}</p> : null;
}
