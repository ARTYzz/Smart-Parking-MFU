import type {
  ParkingDetailApiResponse,
  ParkingZoneApiResponse,
} from "@/types/api";
import type { ParkingSubZone, ParkingZone } from "@/types/parking";
import {
  mapDetailApiToParkingSubZone,
  mapZoneApiToParkingZone,
} from "@/lib/mappers";
import { calculateOccupancyRate, getParkingStatus } from "@/lib/occupancy";
import { toNullableString, toNumber } from "@/lib/utils";

const ZONES_API = process.env.NEXT_PUBLIC_ZONES_API;
const DETAILS_API = process.env.NEXT_PUBLIC_DETAILS_API;
const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE ?? "http://localhost:3000/api/public";
const C5_CAMERA_ID =
  process.env.NEXT_PUBLIC_CAMERA_C5_ID ?? "cam_1pw709e5lwrswc5n";

type GenericObject = Record<string, unknown>;

export interface PublicCameraSummary {
  zoneId: string;
  timestamp: string | null;
  snapLink: string | null;
}

function asObject(value: unknown): GenericObject {
  if (value && typeof value === "object") {
    return value as GenericObject;
  }

  return {};
}

function asList(value: unknown): GenericObject[] {
  if (Array.isArray(value)) {
    return value.map((item) => asObject(item));
  }

  return [];
}

function unwrapPayload(value: unknown): unknown {
  const root = asObject(value);
  return root.data ?? root.items ?? root.zones ?? root.slots ?? value;
}

function pick<T>(obj: GenericObject, keys: string[]): T | undefined {
  for (const key of keys) {
    const value = obj[key] as T | undefined;
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function mapPublicZoneItemToParkingZone(item: GenericObject, index: number): ParkingZone {
  const zoneId =
    toNullableString(pick<string>(item, ["zone", "zoneId", "id", "code"]))
      ?.toUpperCase() ?? `ZONE-${index + 1}`;

  const total = toNumber(pick<number | string>(item, ["total", "capacity", "slotsTotal"]));
  const occupied = toNumber(
    pick<number | string>(item, ["occupied", "occupiedCount", "used"]),
  );
  const freeRaw = pick<number | string>(item, ["free", "available", "freeCount"]);
  const free = freeRaw !== undefined ? toNumber(freeRaw) : Math.max(total - occupied, 0);

  const skipped = toNumber(pick<number | string>(item, ["skipped"]));

  const carOccupied = toNumber(
    pick<number | string>(item, ["car-occ", "carOccupied", "car_occupied"]),
  );
  const carFree = toNumber(
    pick<number | string>(item, ["car-free", "carFree", "car_free"]),
  );
  const motorcycleOccupied = toNumber(
    pick<number | string>(item, ["mt-occ", "motorcycleOccupied", "motorcycle_occupied"]),
  );
  const motorcycleFree = toNumber(
    pick<number | string>(item, ["mt-free", "motorcycleFree", "motorcycle_free"]),
  );

  const hasVehicleBreakdown =
    carOccupied + carFree + motorcycleOccupied + motorcycleFree > 0;
  const timestamp = toNullableString(
    pick<string>(item, ["timestamp", "updatedAt", "processedAt"]),
  );
  const hasData = timestamp !== null || total > 0;

  return {
    id: zoneId,
    name: `โซน ${zoneId}`,
    rowNumber:
      toNumber(pick<number | string>(item, ["row_number", "rowNumber"])) || index + 1,
    timestamp,
    total,
    occupied,
    free,
    skipped,
    car: hasVehicleBreakdown
      ? {
          occupied: carOccupied,
          free: carFree,
        }
      : {
          occupied,
          free,
        },
    motorcycle: hasVehicleBreakdown
      ? {
          occupied: motorcycleOccupied,
          free: motorcycleFree,
        }
      : {
          occupied: 0,
          free: 0,
        },
    snapLink: toNullableString(
      pick<string>(item, ["snap_link", "snapLink", "snapshotUrl"]),
    ),
    hasData,
    occupancyRate: calculateOccupancyRate(occupied, total),
    status: getParkingStatus(hasData, occupied, total),
  };
}

function mapPublicSlotToParkingSubZone(item: GenericObject, index: number): ParkingSubZone {
  const slotName =
    toNullableString(pick<string>(item, ["slot", "slotId", "id", "name"])) ??
    `C5-${index + 1}`;
  const occupiedRaw = pick<boolean | number | string>(item, [
    "occupied",
    "isOccupied",
    "is_occupied",
  ]);
  const statusText =
    toNullableString(pick<string>(item, ["status", "state"]))?.toLowerCase() ?? "";
  const isOccupied =
    occupiedRaw !== undefined
      ? ["true", "1", "yes"].includes(String(occupiedRaw).toLowerCase())
      : ["occupied", "busy", "taken", "full"].includes(statusText);

  const vehicleType =
    toNullableString(pick<string>(item, ["vehicleType", "vehicle_type", "type"]))?.toLowerCase() ??
    "";
  const isMotorcycle = vehicleType.includes("motor");

  const total = 1;
  const occupied = isOccupied ? 1 : 0;
  const free = isOccupied ? 0 : 1;

  return {
    id: slotName,
    name: slotName,
    rowNumber: index + 1,
    timestamp: toNullableString(
      pick<string>(item, ["timestamp", "updatedAt", "processedAt"]),
    ),
    total,
    occupied,
    free,
    skipped: 0,
    car: isMotorcycle
      ? { occupied: 0, free: 0 }
      : { occupied, free },
    motorcycle: isMotorcycle
      ? { occupied, free }
      : { occupied: 0, free: 0 },
    snapLink: null,
    hasData: true,
    occupancyRate: calculateOccupancyRate(occupied, total),
    status: getParkingStatus(true, occupied, total),
  };
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch API: ${url}`);
  }

  return response.json();
}

export async function getParkingZones(): Promise<ParkingZone[]> {
  if (!ZONES_API) {
    throw new Error("NEXT_PUBLIC_ZONES_API is not configured");
  }

  const response = await fetch(ZONES_API, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch parking zones");
  }

  const data = (await response.json()) as ParkingZoneApiResponse[];
  return data.map(mapZoneApiToParkingZone);
}

export async function getParkingZoneDetails(
  zoneId: string,
): Promise<ParkingSubZone[]> {
  if (!DETAILS_API) {
    throw new Error("NEXT_PUBLIC_DETAILS_API is not configured");
  }

  const url = `${DETAILS_API}?zone=${encodeURIComponent(zoneId)}`;

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch parking zone details");
  }

  const data = (await response.json()) as ParkingDetailApiResponse[];
  return data.map(mapDetailApiToParkingSubZone);
}

export async function getPublicZones(): Promise<ParkingZone[]> {
  const payload = await fetchJson(`${PUBLIC_API_BASE}/zones`);
  const list = asList(unwrapPayload(payload));
  return list.map((item, index) => mapPublicZoneItemToParkingZone(item, index));
}

export async function getPublicZonesOrFallback(
  fallback: ParkingZone[],
): Promise<ParkingZone[]> {
  try {
    const zones = await getPublicZones();
    return zones.length > 0 ? zones : fallback;
  } catch {
    return fallback;
  }
}

export async function getC5CameraSummary(): Promise<PublicCameraSummary | null> {
  try {
    const payload = asObject(
      unwrapPayload(
        await fetchJson(`${PUBLIC_API_BASE}/cameras/${encodeURIComponent(C5_CAMERA_ID)}`),
      ),
    );

    return {
      zoneId:
        toNullableString(pick<string>(payload, ["zone", "zoneId", "zone_id"]))
          ?.toUpperCase() ?? "C5",
      timestamp: toNullableString(
        pick<string>(payload, ["timestamp", "updatedAt", "processedAt"]),
      ),
      snapLink: toNullableString(
        pick<string>(payload, ["snap_link", "snapLink", "snapshotUrl"]),
      ),
    };
  } catch {
    return null;
  }
}

export async function getC5CameraSlots(): Promise<ParkingSubZone[] | null> {
  try {
    const payload = await fetchJson(
      `${PUBLIC_API_BASE}/cameras/${encodeURIComponent(C5_CAMERA_ID)}/slots`,
    );
    const list = asList(unwrapPayload(payload));
    return list.map((item, index) => mapPublicSlotToParkingSubZone(item, index));
  } catch {
    return null;
  }
}
