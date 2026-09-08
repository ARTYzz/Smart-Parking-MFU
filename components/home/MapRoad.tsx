import React from "react";

export default function MapRoad({ className = "" }: { className?: string }) {
  // simple rounded road strip with subtle border and shadow
  return (
    <div
      aria-hidden
      className={`rounded-full bg-white/90 border border-white/60 shadow-sm ${className}`}
      style={{ boxShadow: '0 6px 12px rgba(25,28,29,0.06)' }}
    />
  );
}
