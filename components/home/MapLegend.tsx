"use client";
import { useLanguage } from "@/components/providers/language-provider";
import React from "react";

export default function MapLegend() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm text-[#59413F]">{t("Available")}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="text-sm text-[#59413F]">{t("Nearly full")}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm text-[#59413F]">{t("Full")}</span>
      </div>
    </div>
  );
}
