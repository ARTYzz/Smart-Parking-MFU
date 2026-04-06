import type { ParkingSubZone } from "@/types/parking";
import { StatusBadge } from "@/components/parking/status-badge";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface SubZoneCardProps {
  subZone: ParkingSubZone;
}

export function SubZoneCard({ subZone }: SubZoneCardProps) {
  const occupancyRate = Math.round(subZone.occupancyRate * 100);

  return (
    <article className="card-surface rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">พื้นที่ย่อย</p>
          <h3 className="display-font mt-1 text-2xl font-extrabold text-[#191C1D]">
            {subZone.name}
          </h3>
          <p className="mt-1 text-xs text-[#59413F]">Occupancy {occupancyRate}%</p>
        </div>

        <StatusBadge status={subZone.status} />
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
            {subZone.total}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F3F4F5] p-3">
          <p className="text-sm text-[#59413F]">ใช้งาน</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {subZone.occupied}
          </p>
        </div>
        <div className="rounded-2xl bg-[#F3F4F5] p-3">
          <p className="text-sm text-[#59413F]">ว่าง</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {subZone.free}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <VehicleStat
          icon="🚗"
          label="รถยนต์"
          occupied={subZone.car.occupied}
          free={subZone.car.free}
        />
        <VehicleStat
          icon="🏍️"
          label="มอเตอร์ไซค์"
          occupied={subZone.motorcycle.occupied}
          free={subZone.motorcycle.free}
        />
      </div>

      <div className="mt-4 rounded-xl bg-[#F3F4F5] px-3 py-2">
        <p className="text-sm text-[#59413F]">
          {subZone.timestamp
            ? `อัปเดตล่าสุด: ${subZone.timestamp}`
            : "ยังไม่มีข้อมูลจากระบบ"}
        </p>
      </div>
    </article>
  );
}
