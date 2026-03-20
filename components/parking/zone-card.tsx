import Link from "next/link";
import type { ParkingZone } from "@/types/parking";
import { StatusBadge } from "@/components/parking/status-badge";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface ZoneCardProps {
  zone: ParkingZone;
}

export function ZoneCard({ zone }: ZoneCardProps) {
  const isDisabled = !zone.hasData;

  return (
    <Link
      href={`/zone/${encodeURIComponent(zone.id)}`}
      className={[
        "block rounded-3xl border bg-white p-5 shadow-sm transition",
        isDisabled
          ? "cursor-not-allowed border-slate-200 opacity-70"
          : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
      aria-disabled={isDisabled}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">โซน</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{zone.name}</h3>
        </div>

        <StatusBadge status={zone.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">ทั้งหมด</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{zone.total}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">ใช้งาน</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {zone.occupied}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">ว่าง</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{zone.free}</p>
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

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-500">
          {zone.timestamp
            ? `อัปเดตล่าสุด: ${zone.timestamp}`
            : "ยังไม่มีข้อมูลจากระบบ"}
        </p>
      </div>
    </Link>
  );
}
