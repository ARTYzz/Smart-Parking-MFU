"use client";
import { useLanguage } from "@/components/providers/language-provider";
import React from "react";

export default function MapBuilding({ children }: { children?: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-lg bg-[#F6EFE7] p-3 shadow-md border border-white/60">
      <div className="text-xs font-semibold text-[#7D000F]/90">{t(children)}</div>
    </div>
  );
}
