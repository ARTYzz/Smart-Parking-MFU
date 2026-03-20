import type {
  ParkingDetailApiResponse,
  ParkingZoneApiResponse,
} from "@/types/api";
import type { ParkingSubZone, ParkingZone } from "@/types/parking";
import { calculateOccupancyRate, getParkingStatus } from "@/lib/occupancy";
import { toNullableString, toNumber } from "@/lib/utils";

export function mapZoneApiToParkingZone(
  item: ParkingZoneApiResponse,
): ParkingZone {
  const timestamp = toNullableString(item.timestamp);
  const hasData = timestamp !== null;

  const total = toNumber(item.total);
  const occupied = toNumber(item.occupied);
  const free = toNumber(item.free);
  const skipped = toNumber(item.skipped);

  const carOccupied = toNumber(item["car-occ"]);
  const carFree = toNumber(item["car-free"]);
  const motorcycleOccupied = toNumber(item["mt-occ"]);
  const motorcycleFree = toNumber(item["mt-free"]);

  const occupancyRate = calculateOccupancyRate(occupied, total);
  const status = getParkingStatus(hasData, occupied, total);

  return {
    id: item.zone,
    name: item.zone,
    rowNumber: item.row_number,
    timestamp,
    total,
    occupied,
    free,
    skipped,
    car: {
      occupied: carOccupied,
      free: carFree,
    },
    motorcycle: {
      occupied: motorcycleOccupied,
      free: motorcycleFree,
    },
    snapLink: toNullableString(item.snap_link),
    hasData,
    occupancyRate,
    status,
  };
}

export function mapDetailApiToParkingSubZone(
  item: ParkingDetailApiResponse,
): ParkingSubZone {
  const timestamp = toNullableString(item.timestamp);
  const hasData = timestamp !== null;

  const total = toNumber(item.total);
  const occupied = toNumber(item.occupied);
  const free = toNumber(item.free);
  const skipped = toNumber(item.skipped);

  const carOccupied = toNumber(item["car-occ"]);
  const carFree = toNumber(item["car-free"]);
  const motorcycleOccupied = toNumber(item["motercycle-occ"]);
  const motorcycleFree = toNumber(item["motocycle-free"]);

  const occupancyRate = calculateOccupancyRate(occupied, total);
  const status = getParkingStatus(hasData, occupied, total);

  return {
    id: item.zone,
    name: item.zone,
    rowNumber: item.row_number,
    timestamp,
    total,
    occupied,
    free,
    skipped,
    car: {
      occupied: carOccupied,
      free: carFree,
    },
    motorcycle: {
      occupied: motorcycleOccupied,
      free: motorcycleFree,
    },
    snapLink: toNullableString(item.snap_link),
    hasData,
    occupancyRate,
    status,
  };
}
