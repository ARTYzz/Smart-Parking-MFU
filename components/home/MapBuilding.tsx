import React from "react";

export default function MapBuilding({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#F6EFE7] p-3 shadow-md border border-white/60">
      <div className="text-xs font-semibold text-[#7D000F]/90">{children}</div>
    </div>
  );
}
