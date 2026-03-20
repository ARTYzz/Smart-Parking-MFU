import type { ParkingStatus } from "@/types/parking";

export function calculateOccupancyRate(
  occupied: number,
  total: number,
): number {
  if (total <= 0) return 0;
  return occupied / total;
}

export function getParkingStatus(
  hasData: boolean,
  occupied: number,
  total: number,
): ParkingStatus {
  if (!hasData) return "no-data";

  const rate = calculateOccupancyRate(occupied, total);

  if (rate >= 0.9) return "full";
  if (rate >= 0.7) return "nearly-full";
  return "available";
}
