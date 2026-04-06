import Link from "next/link";
import type { ParkingZone } from "@/types/parking";
import { StatusBadge } from "@/components/parking/status-badge";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface ZoneCardProps {
  zone: ParkingZone;
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const isDisabled = !zone.hasData;
  const occupancyRate = Math.round(zone.occupancyRate * 100);

  return (
    <Link
      href={`/zone/${encodeURIComponent(zone.id)}`}
      className={[
        "card-surface block rounded-3xl p-5 transition",
        isDisabled
          ? "cursor-not-allowed opacity-70"
          : "hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(25,28,29,0.08)]",
      ].join(" ")}
      aria-disabled={isDisabled}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">โซน</p>
          <h3 className="display-font mt-1 text-2xl font-extrabold text-[#191C1D]">
            {zone.name}
          </h3>
          <p className="mt-1 text-xs text-[#59413F]">Occupancy {occupancyRate}%</p>
        </div>

        <StatusBadge status={zone.status} />
      </div>

      <div className="mt-3 h-2 rounded-full bg-[#F3F4F5]">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#7D000F] to-[#A01D22]"
          style={{ width: `${occupancyRate}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#F3F4F5] p-3">
          <p className="text-sm text-[#59413F]">ทั้งหมด</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {zone.total}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F3F4F5] p-3">
          <p className="text-sm text-[#59413F]">ใช้งาน</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {zone.occupied}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F3F4F5] p-3">
          <p className="text-sm text-[#59413F]">ว่าง</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {zone.free}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <VehicleStat
          icon="🚗"
          label="รถยนต์"
          occupied={zone.car.occupied}
          free={zone.car.free}
        />
        <VehicleStat
          icon="🏍️"
          label="มอเตอร์ไซค์"
          occupied={zone.motorcycle.occupied}
          free={zone.motorcycle.free}
        />
      </div>

      <div className="mt-4 rounded-xl bg-[#F3F4F5] px-3 py-2">
        <p className="text-sm text-[#59413F]">
          {zone.timestamp
            ? `อัปเดตล่าสุด: ${zone.timestamp}`
            : "ยังไม่มีข้อมูลจากระบบ"}
        </p>
      </div>
    </Link>
  );
}
