"use client";
import { useLanguage } from "@/components/providers/language-provider";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import ZoneMarker from "./ZoneMarker";
import ZoneDetailCard from "./ZoneDetailCard";

type ZoneStatus = {
  zoneId: string;
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  status: "available" | "nearly-full" | "full" | "no-data";
  updatedAt?: string | null;
};

const zonePositions: Record<string, { x: number; y: number }> = {
  C1: { x: 52, y: 43 },
  C2: { x: 58, y: 32 },
  C3: { x: 63, y: 43 },
  C5: { x: 74, y: 40 },
  E1: { x: 35, y: 62 },
};

export function MapOverview({ zones }: { zones: ZoneStatus[] }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);

  const zoneLookup = useMemo(() => {
    const map: Record<string, ZoneStatus> = {};
    for (const z of zones) map[z.zoneId.toUpperCase()] = z;
    return map;
  }, [zones]);

  const markers: Array<{
    zoneId: string;
    x: number;
    y: number;
    status: ZoneStatus["status"];
    availableSlots: number;
    totalSlots: number;
    updatedAt?: string | null;
  }> = Object.keys(zonePositions).map((zoneId) => {
    const pos = zonePositions[zoneId];
    const data = zoneLookup[zoneId] ?? {
      zoneId,
      totalSlots: 0,
      occupiedSlots: 0,
      availableSlots: 0,
      status: "no-data",
      updatedAt: null,
    };

    const status = data.status ?? "no-data";

    return {
      ...pos,
      zoneId,
      status,
      availableSlots: data.availableSlots,
      totalSlots: data.totalSlots,
      updatedAt: data.updatedAt,
    };
  });

  const selectedZoneData = selected ? zoneLookup[selected] ?? null : null;

  return (
    <div>
      <div className="relative w-full overflow-hidden rounded-2xl aspect-[16/9]">
        <Image src="/mfu-map.png" alt={t("MFU map")} fill className="object-cover rounded-2xl" />

        {t(markers.map((m) => (
          <ZoneMarker
            key={m.zoneId}
            id={m.zoneId}
            status={m.status}
            x={m.x}
            y={m.y}
            selected={selected === m.zoneId}
            onClick={(id) => setSelected(id === selected ? null : id)}
            availableSlots={m.availableSlots}
            totalSlots={m.totalSlots}
          />
        )))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm text-[#59413F]">{t("Available")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-sm text-[#59413F]">{t("Nearly full")}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm text-[#59413F]">{t("Full")}</span>
        </div>
      </div>

      <div className="mt-4">
        <ZoneDetailCard zone={selectedZoneData ? {
          zoneId: selectedZoneData.zoneId,
          totalSlots: selectedZoneData.totalSlots,
          occupiedSlots: selectedZoneData.occupiedSlots,
          availableSlots: selectedZoneData.availableSlots,
          status: selectedZoneData.status,
          updatedAt: selectedZoneData.updatedAt,
        } : null} />
      </div>
    </div>
  );
}

export default MapOverview;
