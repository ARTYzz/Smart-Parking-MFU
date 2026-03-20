import type {
  ParkingSubZone,
  ParkingSummary,
  ParkingZone,
} from "@/types/parking";

type ParkingSummarySource = ParkingZone | ParkingSubZone;

export function buildParkingSummary(
  zones: ParkingSummarySource[],
): ParkingSummary {
  return zones.reduce<ParkingSummary>(
    (acc, zone) => {
      if (!zone.hasData) {
        return acc;
      }

      acc.total += zone.total;
      acc.occupied += zone.occupied;
      acc.free += zone.free;
      acc.skipped += zone.skipped;

      acc.car.occupied += zone.car.occupied;
      acc.car.free += zone.car.free;

      acc.motorcycle.occupied += zone.motorcycle.occupied;
      acc.motorcycle.free += zone.motorcycle.free;

      return acc;
    },
    {
      total: 0,
      occupied: 0,
      free: 0,
      skipped: 0,
      car: {
        occupied: 0,
        free: 0,
      },
      motorcycle: {
        occupied: 0,
        free: 0,
      },
    },
  );
}
