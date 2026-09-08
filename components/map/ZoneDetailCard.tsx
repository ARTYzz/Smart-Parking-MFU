"use client";
import React from "react";
import Link from "next/link";

type ZoneStatus = {
  zoneId: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  status: "available" | "nearly-full" | "full" | "no-data";
  updatedAt?: string | null;
};

function statusLabel(status: ZoneStatus["status"]) {
  if (status === "no-data") return { text: "No data", className: "bg-gray-100 text-gray-800" };
  if (status === "available") return { text: "Available", className: "bg-green-100 text-green-800" };
  if (status === "nearly-full") return { text: "Nearly Full", className: "bg-yellow-100 text-yellow-800" };
  return { text: "Full", className: "bg-red-100 text-red-800" };
}

export function ZoneDetailCard({ zone }: { zone: ZoneStatus | null }) {
  if (!zone) return null;

  const badge = statusLabel(zone.status);

  return (
    <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="display-font text-lg font-extrabold">โซน {zone.zoneId}</h4>
          <p className="mt-1 text-sm text-[#59413F]">Updated: {zone.updatedAt ?? "-"}</p>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.text}</div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#F3F4F5] p-3">
          <p className="text-xs text-[#59413F]">Available</p>
          <p className="display-font mt-1 text-2xl font-extrabold">{zone.availableSlots}</p>
        </div>
        <div className="rounded-xl bg-[#F3F4F5] p-3">
          <p className="text-xs text-[#59413F]">Total</p>
          <p className="display-font mt-1 text-2xl font-extrabold">{zone.totalSlots}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Link href={`/zone/${encodeURIComponent(zone.zoneId)}`} className="primary-cta rounded-xl px-4 py-2 text-sm font-semibold">
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ZoneDetailCard;
