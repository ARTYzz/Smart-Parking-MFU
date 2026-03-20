import type { ParkingSummary } from "@/types/parking";
import { VehicleStat } from "@/components/parking/vehicle-stat";

interface ZoneSummaryCardProps {
  summary: ParkingSummary;
}

export function ZoneSummaryCard({ summary }: ZoneSummaryCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">ภาพรวมทุกโซน</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            ช่องจอดทั้งหมด {summary.total}
          </h2>
        </div>

        <div className="flex gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-slate-500">ใช้งาน</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {summary.occupied}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-slate-500">ว่าง</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {summary.free}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <VehicleStat
          icon="🚗"
          label="รถยนต์"
          occupied={summary.car.occupied}
          free={summary.car.free}
        />
        <VehicleStat
          icon="🏍️"
          label="มอเตอร์ไซค์"
          occupied={summary.motorcycle.occupied}
          free={summary.motorcycle.free}
        />
      </div>
    </section>
  );
}
