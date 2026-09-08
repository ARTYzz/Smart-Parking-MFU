"use client";
import React, { useMemo, useState } from "react";
import MapLegend from "./MapLegend";
import ZoneStatusCard from "./ZoneStatusCard";

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

import { zoneCatalog } from "@/lib/services/catalog";
const zoneMarkers = zoneCatalog.map(zone => ({ ...zone, label: zone.id, sublabel: zone.id === "M-STORE" ? "L-Park / E-Park" : undefined }));
function ZoneMarker({
  zone,
  label,
  sublabel,
  selected,
  onSelect,
}: {
  zone: ZoneStatus;
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: (zoneId: string) => void;
}) {
  const statusColor: Record<ZoneStatus["status"], string> = {
    available: "bg-[#63D98B]",
    nearly_full: "bg-[#F2C96B]",
    full: "bg-[#F06A6A]",
    "no-data": "bg-[#DADDE2]",
  };

  return (
    <button
      onClick={() => onSelect(zone.zoneId)}
      className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-md bg-white border border-white/70 transition-transform ${
        selected ? "-translate-y-1 ring-4 ring-white/60" : "hover:-translate-y-0.5"
      }`}
      aria-pressed={selected}
    >
      <span className={`w-3 h-3 rounded-full ${statusColor[zone.status]}`} />
      <span className="text-sm font-semibold text-[#191C1D]">{label}</span>
      <span className="text-xs text-[#59413F]">
        {zone.bookableSlots ?? zone.availableSlots}/{zone.totalSlots}
      </span>
      {sublabel ? <span className="ml-1 text-[0.6rem] text-[#7D000F]/70">{sublabel}</span> : null}
    </button>
  );
}

export default function CampusParkingMap({ zones }: { zones: ZoneStatus[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  const zoneMap = useMemo(() => {
    const m: Record<string, ZoneStatus> = {};
    for (const z of zones) m[z.zoneId.toUpperCase()] = z;
    return m;
  }, [zones]);

  const selectedZoneData = selected ? zoneMap[selected] ?? { zoneId: selected, totalSlots: 0, occupiedSlots: 0, availableSlots: 0, status: "no-data" as const } : null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#E3E0DA] p-6">
        <div
          className="relative aspect-[4/3] min-h-[420px] md:min-h-[640px] w-full overflow-hidden rounded-2xl border border-white/70 shadow-sm bg-cover bg-center"
          style={{ backgroundImage: "url('/images/mfu-campus-map.png')" }}
        >

            {/* zone markers */}
          {zoneMarkers.map((marker) => {
            const zone =
              zoneMap[marker.id.toUpperCase()] ??
              ({
                zoneId: marker.id,
                totalSlots: 0,
                occupiedSlots: 0,
                availableSlots: 0,
                status: "no-data",
              } as ZoneStatus);

            return (
              <div
                key={marker.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: marker.left, top: marker.top }}
              >
                <ZoneMarker
                  zone={zone}
                  label={marker.label}
                  sublabel={marker.sublabel}
                  selected={selected === marker.id}
                  onSelect={setSelected}
                />
              </div>
            );
          })}
          </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <MapLegend />
          <div className="text-xs text-[#59413F]">MFU campus schematic</div>
        </div>
      </div>

      <div className="rounded-2xl p-4 bg-white shadow-sm border border-white/60">
        <h3 className="font-semibold text-[#191C1D]">Zone Details</h3>
        <div className="mt-3">
          <ZoneStatusCard
            zone={
              selectedZoneData
                ? {
                    zoneId: selectedZoneData.zoneId,
                    totalSlots: selectedZoneData.totalSlots,
                    occupiedSlots: selectedZoneData.occupiedSlots,
                    availableSlots: selectedZoneData.availableSlots,
                    bookableSlots: selectedZoneData.bookableSlots,
                    reservedSlots: selectedZoneData.reservedSlots,
                    status: selectedZoneData.status,
                    updatedAt: selectedZoneData.updatedAt,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}

