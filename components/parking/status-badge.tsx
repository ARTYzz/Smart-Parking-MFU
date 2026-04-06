import type { ParkingStatus } from "@/types/parking";

interface StatusBadgeProps {
  status: ParkingStatus;
}

const statusMap: Record<ParkingStatus, { label: string; tone: string; text: string }> = {
  available: {
    label: "ว่าง",
    tone: "#D9F3E5",
    text: "#0B5A38",
  },
  "nearly-full": {
    label: "ใกล้เต็ม",
    tone: "#FDECC4",
    text: "#785A1A",
  },
  full: {
    label: "เต็ม",
    tone: "#FFDAD6",
    text: "#7D000F",
  },
  "no-data": {
    label: "ไม่มีข้อมูล",
    tone: "#EDEEF0",
    text: "#59413F",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <span
      className="label-caps inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold"
      style={{ backgroundColor: config.tone, color: config.text }}
    >
      {config.label}
    </span>
  );
}
