import type { ParkingSubZone } from "@/types/parking";
import { StatusBadge } from "@/components/parking/status-badge";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface SubZoneCardProps {
  subZone: ParkingSubZone;
}

export function SubZoneCard({ subZone }: SubZoneCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">พื้นที่ย่อย</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {subZone.name}
          </h3>
        </div>

        <StatusBadge status={subZone.status} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">ทั้งหมด</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {subZone.total}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">ใช้งาน</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {subZone.occupied}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm text-slate-500">ว่าง</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
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

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-500">
          {subZone.timestamp
            ? `อัปเดตล่าสุด: ${subZone.timestamp}`
            : "ยังไม่มีข้อมูลจากระบบ"}
        </p>
      </div>
    </article>
  );
}
