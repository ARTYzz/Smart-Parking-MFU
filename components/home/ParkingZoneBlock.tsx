"use client";
import { useLanguage } from "@/components/providers/language-provider";
import React from "react";

export type ZoneStatus = {
  zoneId: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  status: "available" | "nearly_full" | "full" | "no-data";
};

function statusBg(status: ZoneStatus["status"]) {
  if (status === "available") return "bg-green-500 text-white";
  if (status === "nearly_full") return "bg-yellow-500 text-black";
  if (status === "full") return "bg-red-500 text-white";
  return "bg-gray-300 text-black";
}

export default function ParkingZoneBlock({
  zone,
  onClick,
  selected = false,
}: {
  zone: ZoneStatus;
  onClick?: (zoneId: string) => void;
  selected?: boolean;
}) {
  const { t } = useLanguage();
  const cls = statusBg(zone.status);

  return (
    <button
      onClick={() => onClick?.(zone.zoneId)}
      aria-pressed={selected}
      className={`relative w-36 h-20 bg-white rounded-2xl shadow-md p-3 text-left transition-transform duration-150 ${
        selected ? "-translate-y-1 scale-105 ring-4 ring-offset-2 ring-white/60" : "hover:-translate-y-0.5"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${cls} shadow-sm`} />
          <span className="font-semibold text-sm">{t(zone.zoneId)}</span>
        </div>
        <div className="text-xs text-[#59413F]">{t(zone.availableSlots)}{t("/")}{t(zone.totalSlots)}</div>
      </div>

      <div className="absolute left-3 bottom-3 text-xs text-[#7D000F]/80">{t(zone.status === 'no-data' ? 'No data' : zone.status.replace('_', ' '))}</div>
    </button>
  );
}
