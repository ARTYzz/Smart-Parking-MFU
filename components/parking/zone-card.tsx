"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";
import { BookingAvailabilityPanel } from "@/components/booking/availability";
import type { ParkingZone } from "@/types/parking";
import { StatusBadge } from "@/components/parking/status-badge";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface ZoneCardProps {
  zone: ParkingZone;
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const { t } = useLanguage();
  const isDisabled = !zone.hasData;
  const occupancyRate = Math.round(zone.occupancyRate * 100);

  return (
    <Link
      href={`/zone/${encodeURIComponent(zone.id)}`}
      className={[
        "group block rounded-3xl border border-[#e8dfdb] bg-white p-6 shadow-[0_4px_20px_#59413f08] transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7d000f]",
        isDisabled
          ? "opacity-75"
          : "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(25,28,29,0.08)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">{t("โซน")}</p>
          <h3 className="display-font mt-1 text-3xl font-extrabold text-[#191C1D]">
            {t(zone.name)}
          </h3>
          <p className="mt-1 text-xs text-[#59413F]">{t("Occupancy ")}{t(occupancyRate)}{t("%")}</p>
        </div>

        <StatusBadge status={zone.status} />
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f2ece7]">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#7D000F] to-[#A01D22]"
          style={{ width: `${occupancyRate}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-3 divide-x divide-[#e9e1db] rounded-2xl border border-[#eee6df] bg-[#faf8f5] py-4">
        <div className="px-3 text-center">
          <p className="text-sm text-[#59413F]">{t("ทั้งหมด")}</p>
          <p className="display-font mt-1 text-2xl font-extrabold tabular-nums text-[#7d000f]">
            {t(zone.total)}
          </p>
        </div>
        <div className="px-3 text-center">
          <p className="text-sm text-[#59413F]">{t("ใช้งาน")}</p>
          <p className="display-font mt-1 text-2xl font-extrabold tabular-nums text-[#7d000f]">
            {t(zone.occupied)}
          </p>
        </div>
        <div className="px-3 text-center">
          <p className="text-sm text-[#59413F]">{t("ว่าง")}</p>
          <p className="display-font mt-1 text-2xl font-extrabold tabular-nums text-[#7d000f]">
            {t(zone.free)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <VehicleStat
          icon="🚗"
          label={t("รถยนต์")}
          occupied={zone.car.occupied}
          free={zone.car.free}
        />
        <VehicleStat
          icon="🏍️"
          label={t("มอเตอร์ไซค์")}
          occupied={zone.motorcycle.occupied}
          free={zone.motorcycle.free}
        />
      </div>

      <div className="mt-5 border-t border-[#eee6df] pt-4">
        <p className="text-sm text-[#59413F]">
          {t(zone.timestamp
            ? `อัปเดตล่าสุด: ${zone.timestamp}`
            : "ยังไม่มีข้อมูลจากระบบ")}
        </p>
      </div>
      <BookingAvailabilityPanel zoneId={zone.id} />
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-[#7d000f]"><span>{t("ดูรายละเอียด")}</span><span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5ebe7] transition group-hover:bg-[#7d000f] group-hover:text-white">↗</span></div>
    </Link>
  );
}
