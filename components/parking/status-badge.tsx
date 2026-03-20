import type { ParkingStatus } from "@/types/parking";

interface StatusBadgeProps {
  status: ParkingStatus;
}

const statusMap: Record<ParkingStatus, { label: string; className: string }> = {
  available: {
    label: "ว่าง",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  "nearly-full": {
    label: "ใกล้เต็ม",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  full: {
    label: "เต็ม",
    className: "bg-rose-100 text-rose-700 border-rose-200",
  },
  "no-data": {
    label: "ไม่มีข้อมูล",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
