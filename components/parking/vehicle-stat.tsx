interface VehicleStatProps {
  icon: string;
  label: string;
  occupied: number;
  free: number;
}

export function VehicleStat({ icon, label, occupied, free }: VehicleStatProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <span>{icon}</span>
        <span>{label}</span>
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">ใช้งาน</span>
        <span className="font-semibold text-slate-900">{occupied}</span>
      </div>

      <div className="mt-1 flex items-center justify-between text-sm">
        <span className="text-slate-500">ว่าง</span>
        <span className="font-semibold text-slate-900">{free}</span>
      </div>
    </div>
  );
}
