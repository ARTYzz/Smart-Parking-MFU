"use client";
import { useLanguage } from "@/components/providers/language-provider";
interface VehicleStatProps {
  icon: string;
  label: string;
  occupied: number;
  free: number;
}

export function VehicleStat({ icon, label, occupied, free }: VehicleStatProps) {
  const { t } = useLanguage();
  const total = occupied + free;
  const usedPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[#ece4dd] bg-[#fcfaf7] p-3">
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-[#59413F]">
        <div className="flex items-center gap-2">
        <span>{t(icon)}</span>
        <span>{t(label)}</span>
        </div>
        <span className="label-caps rounded-full bg-white px-2 py-1 text-[0.62rem] font-semibold text-[#7D000F]">
          {t(usedPercent)}{t("% used")}</span>
      </div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#eee5dc]">
        <div
          className="h-1 rounded-full bg-gradient-to-r from-[#7D000F] to-[#A01D22]"
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="px-1 py-1">
          <p className="text-[#59413F]">{t("ใช้งาน")}</p>
          <p className="display-font mt-1 text-lg font-bold tabular-nums text-[#191C1D]">
            {t(occupied)}
          </p>
        </div>
        <div className="px-1 py-1">
          <p className="text-[#59413F]">{t("ว่าง")}</p>
          <p className="display-font mt-1 text-lg font-bold tabular-nums text-[#191C1D]">
            {t(free)}
          </p>
        </div>
      </div>
    </div>
  );
}
