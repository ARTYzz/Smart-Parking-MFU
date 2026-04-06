interface VehicleStatProps {
  icon: string;
  label: string;
  occupied: number;
  free: number;
}

export function VehicleStat({ icon, label, occupied, free }: VehicleStatProps) {
  const total = occupied + free;
  const usedPercent = total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-[#F3F4F5] p-3">
      <div className="flex items-center justify-between gap-2 text-sm font-medium text-[#59413F]">
        <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span>{label}</span>
        </div>
        <span className="label-caps rounded-full bg-white px-2 py-1 text-[0.62rem] font-semibold text-[#7D000F]">
          {usedPercent}% used
        </span>
      </div>

      <div className="mt-3 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#7D000F] to-[#A01D22]"
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-white px-3 py-2">
          <p className="text-[#59413F]">ใช้งาน</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {occupied}
          </p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2">
          <p className="text-[#59413F]">ว่าง</p>
          <p className="display-font mt-1 text-lg font-extrabold text-[#191C1D]">
            {free}
          </p>
        </div>
      </div>
    </div>
  );
}
