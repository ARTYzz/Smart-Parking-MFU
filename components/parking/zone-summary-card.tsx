"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { BookingAvailabilityPanel } from "@/components/booking/availability";
import type { ParkingSummary } from "@/types/parking";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface ZoneSummaryCardProps {
  summary: ParkingSummary;
  zoneId?: string;
}

export function ZoneSummaryCard({ summary, zoneId }: ZoneSummaryCardProps) {
  const { t } = useLanguage();
  const occupancyRate =
    summary.total > 0 ? Math.round((summary.occupied / summary.total) * 100) : 0;

  return (
    <section className="card-surface rounded-3xl p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">{t("Live Overview")}</p>
          <h2 className="display-font mt-2 text-2xl font-extrabold text-[#191C1D] md:text-3xl">{t("ช่องจอดทั้งหมด")}{t(summary.total)}
          </h2>
          <p className="mt-2 text-sm text-[#59413F]">{t("Occupancy ปัจจุบัน")}{t(occupancyRate)}{t("% จากทุกพื้นที่ในระบบ")}</p>
          <div className="mt-3 h-2 w-full max-w-md rounded-full bg-[#F3F4F5]">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#7D000F] to-[#A01D22]"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <div className="rounded-2xl bg-[#F3F4F5] px-4 py-3">
            <p className="text-[#59413F]">{t("ใช้งาน")}</p>
            <p className="display-font mt-1 text-xl font-extrabold text-[#191C1D]">
              {t(summary.occupied)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F3F4F5] px-4 py-3">
            <p className="text-[#59413F]">{t("ว่าง")}</p>
            <p className="display-font mt-1 text-xl font-extrabold text-[#191C1D]">
              {t(summary.free)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <VehicleStat
          icon="🚗"
          label={t("รถยนต์")}
          occupied={summary.car.occupied}
          free={summary.car.free}
        />
        <VehicleStat
          icon="🏍️"
          label={t("มอเตอร์ไซค์")}
          occupied={summary.motorcycle.occupied}
          free={summary.motorcycle.free}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href="/find-spot"
          className="primary-cta rounded-xl px-4 py-2 text-sm font-semibold"
        >{t("เปิด Quick Finder")}</Link>
        <Link
          href="/parking-zones"
          className="secondary-cta rounded-xl px-4 py-2 text-sm font-semibold"
        >{t("เลือกโซนจอดรถ")}</Link>
      </div>
      <BookingAvailabilityPanel zoneId={zoneId} />
    </section>
  );
}
