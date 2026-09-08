import React from "react";

export default function MapLegend() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-[#59413F]">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="text-sm text-[#59413F]">Nearly full</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm text-[#59413F]">Full</span>
      </div>
    </div>
  );
}
