"use client";
import React from "react";

type ZoneMarkerProps = {
  id: string;
  status: "available" | "nearly-full" | "full" | "no-data";
  availableSlots: number;
  totalSlots: number;
  x: number; // percent
  y: number; // percent
  onClick?: (id: string) => void;
  selected?: boolean;
};

function statusClass(status: ZoneMarkerProps["status"]) {
  if (status === "available") return "bg-green-500";
  if (status === "nearly-full") return "bg-yellow-500 text-black";
  if (status === "full") return "bg-red-500";
  return "bg-gray-400";
}

export function ZoneMarker({ id, status, x, y, onClick, selected }: ZoneMarkerProps) {
  const cls = statusClass(status);

  return (
    <button
      aria-label={`Zone ${id} marker`}
      onClick={() => onClick?.(id)}
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
      className={`absolute z-20 flex items-center gap-2 px-3 py-1 rounded-full text-white shadow-lg ring-2 ring-white/70 transition-transform duration-150 ${cls} ${
        selected ? "scale-110 ring-4 ring-offset-2" : "hover:scale-105"
      }`}
    >
      <span className="font-semibold text-sm">{id}</span>
    </button>
  );
}

export default ZoneMarker;
