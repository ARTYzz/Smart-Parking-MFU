"use client";
import React from "react";
import Link from "next/link";

export type ZoneStatus = {
  zoneId: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  bookableSlots?: number;
  reservedSlots?: number;
  status: "available" | "nearly_full" | "full" | "no-data";
  updatedAt?: string | null;
};

function statusBadge(status: ZoneStatus["status"]) {
  if (status === "available") return { text: "Available", cls: "bg-green-100 text-green-800" };
  if (status === "nearly_full") return { text: "Nearly full", cls: "bg-yellow-100 text-yellow-800" };
  if (status === "full") return { text: "Full", cls: "bg-red-100 text-red-800" };
  return { text: "No data", cls: "bg-gray-100 text-gray-700" };
}

export default function ZoneStatusCard({ zone }: { zone: ZoneStatus | null }) {
  if (!zone) return null;
  const badge = statusBadge(zone.status);

  return (
    <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="display-font text-lg font-extrabold">โซน {zone.zoneId}</h4>
          <p className="mt-1 text-sm text-[#59413F]">Updated: {zone.updatedAt ?? "-"}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.cls}`}>{badge.text}</div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#F3F4F5] p-3 text-center">
          <p className="text-xs text-[#59413F]">ว่างจากรถ</p>
          <p className="display-font mt-1 text-2xl font-extrabold">{zone.availableSlots}</p>
        </div>
        <div className="rounded-xl bg-[#F3F4F5] p-3 text-center">
          <p className="text-xs text-[#59413F]">Occupied</p>
          <p className="display-font mt-1 text-2xl font-extrabold">{zone.occupiedSlots}</p>
        </div>
        <div className="rounded-xl bg-[#F3F4F5] p-3 text-center">
          <p className="text-xs text-[#59413F]">Total</p>
          <p className="display-font mt-1 text-2xl font-extrabold">{zone.totalSlots}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {zone.bookableSlots !== undefined && <p className="text-sm">พร้อมจอง {zone.bookableSlots} • จองในช่วงนี้ {zone.reservedSlots ?? 0}</p>}
        <Link href={`/zone/${encodeURIComponent(zone.zoneId)}`} className="primary-cta rounded-xl px-4 py-2 text-sm font-semibold">
          View Details
        </Link>
      </div>
    </div>
  );
}
