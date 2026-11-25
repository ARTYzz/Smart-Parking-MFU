import type {
  ParkingDetailApiResponse,
  ParkingZoneApiResponse,
} from "@/types/api";
import type { ParkingSubZone, ParkingSummary, ParkingZone } from "@/types/parking";
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
const PARKING_API_DEBUG = process.env.NEXT_PUBLIC_PARKING_API_DEBUG === "1";

type GenericObject = Record<string, unknown>;
const LIST_KEYS = [
  "data",
  "items",
  "zones",
  "slots",
  "results",
  "records",
  "list",
  "parkingSlots",
];

export interface PublicCameraSummary {
  zoneId: string;
  timestamp: string | null;
  snapLink: string | null;
}

export interface PublicZoneSnapshot {
  zoneId: string;
  summary: ParkingSummary;
}

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (!PARKING_API_DEBUG) {
    return;
  }

  if (meta) {
    console.info(`[parking-api] ${message}`, meta);
    return;
  }

  console.info(`[parking-api] ${message}`);
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
  return root.data ?? root.items ?? root.zones ?? root.slots ?? root.results ?? value;
}

function extractList(value: unknown): GenericObject[] {
  if (Array.isArray(value)) {
    return asList(value);
  }

  const queue: unknown[] = [value];

  while (queue.length > 0) {
    const current = queue.shift();
    if (Array.isArray(current)) {
      return asList(current);
    }

    const obj = asObject(current);
    for (const key of LIST_KEYS) {
      if (obj[key] !== undefined) {
        queue.push(obj[key]);
      }
    }
  }

  return [];
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
    pick<number | string>(item, ["occupied", "occupiedCount", "used", "filled"]),
  );
  const freeRaw = pick<number | string>(item, ["free", "available", "freeCount", "empty"]);
  const free = freeRaw !== undefined ? toNumber(freeRaw) : Math.max(total - occupied, 0);

  const skipped = toNumber(pick<number | string>(item, ["skipped"]));

  const carOccupied = toNumber(
    pick<number | string>(item, ["car-occ", "carOccupied", "car_occupied", "carOcc"]),
  );
  const carFree = toNumber(
    pick<number | string>(item, ["car-free", "carFree", "car_free", "carFreeCount"]),
  );
  const motorcycleOccupied = toNumber(
    pick<number | string>(item, ["mt-occ", "mt_occ", "motorcycleOccupied", "motorcycle_occupied"]),
  );
  const motorcycleFree = toNumber(
    pick<number | string>(item, ["mt-free", "mt_free", "motorcycleFree", "motorcycle_free"]),
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
      : ["occupied", "busy", "taken", "full", "filled", "used"].includes(statusText);

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
    hasData:
      toNullableString(pick<string>(item, ["timestamp", "updatedAt", "processedAt"])) !==
        null ||
      total > 0,
    occupancyRate: calculateOccupancyRate(occupied, total),
    status: getParkingStatus(true, occupied, total),
  };
}

function mapPublicSummaryToParkingSummary(item: GenericObject): ParkingSummary {
  const total = toNumber(pick<number | string>(item, ["total", "capacity", "slotsTotal"]));
  const occupied = toNumber(
    pick<number | string>(item, ["occupied", "occupiedCount", "used", "filled"]),
  );
  const freeRaw = pick<number | string>(item, ["free", "available", "freeCount", "empty"]);
  const free = freeRaw !== undefined ? toNumber(freeRaw) : Math.max(total - occupied, 0);

  const carOccupied = toNumber(
    pick<number | string>(item, ["car-occ", "carOccupied", "car_occupied", "carOcc"]),
  );
  const carFree = toNumber(
    pick<number | string>(item, ["car-free", "carFree", "car_free", "carFreeCount"]),
  );
  const motorcycleOccupied = toNumber(
    pick<number | string>(item, ["mt-occ", "mt_occ", "motorcycleOccupied", "motorcycle_occupied"]),
  );
  const motorcycleFree = toNumber(
    pick<number | string>(item, ["mt-free", "mt_free", "motorcycleFree", "motorcycle_free"]),
  );

  const hasVehicleBreakdown =
    carOccupied + carFree + motorcycleOccupied + motorcycleFree > 0;

  return {
    total,
    occupied,
    free,
    skipped: toNumber(pick<number | string>(item, ["skipped"])),
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

  const url = new URL(DETAILS_API, typeof window === "undefined" ? undefined : window.location.origin);
  url.searchParams.set("zone", zoneId);

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
  if (ZONES_API) return getParkingZones();
  const url = `${PUBLIC_API_BASE}/zones`;
  const payload = await fetchJson(url);
  const list = extractList(unwrapPayload(payload));
  const zones = list.map((item, index) => mapPublicZoneItemToParkingZone(item, index));

  debugLog("Loaded public zones", {
    url,
    rawCount: list.length,
    mappedCount: zones.length,
  });

  return zones;
}

export async function getAdminParkingZones(): Promise<ParkingZone[]> {
  const payload = await fetchJson("/api/parking/zones");
  return extractList(unwrapPayload(payload)).map((item, index) => {
    const id = String(item.zone).toUpperCase();
    const timestamp = toNullableString(item.last_updated);
    const total = toNumber(pick<number>(item, ["total_slots"]));
    const free = toNumber(pick<number>(item, ["free_slots"]));
    const occupied = toNumber(pick<number>(item, ["occupied_slots"]));
    const skipped = toNumber(pick<number>(item, ["unknown_slots"]));
    const hasData = timestamp !== null && occupied + free > 0;
    const stats = (value: unknown) => {
      const breakdown = asObject(value);
      return { free: toNumber(pick<number>(breakdown, ["free"])), occupied: toNumber(pick<number>(breakdown, ["occupied"])) };
    };
    const status = getParkingStatus(hasData, occupied, total);
    return {
      id, name: `โซน ${id}`, rowNumber: index + 1, timestamp, total, occupied, free, skipped,
      car: stats(item.car), motorcycle: stats(item.motorcycle), snapLink: null, hasData,
      occupancyRate: calculateOccupancyRate(occupied, total),
      status: hasData && free === 0 && skipped > 0 ? "no-data" : status,
    };
  });
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

export async function getPublicZoneSummary(
  zoneId: string,
): Promise<PublicZoneSnapshot | null> {
  try {
    const normalizedZoneId = zoneId.toUpperCase();
    const url = `${PUBLIC_API_BASE}/zones/${encodeURIComponent(normalizedZoneId)}/summary`;
    const raw = await fetchJson(url);
    const payload = asObject(unwrapPayload(raw));
    const nestedSummary = asObject(
      pick<unknown>(payload, ["summary", "zoneSummary", "result"]),
    );
    const effective = Object.keys(nestedSummary).length > 0 ? nestedSummary : payload;

    const summary = mapPublicSummaryToParkingSummary(effective);

    debugLog("Loaded public zone summary", {
      url,
      zoneId: normalizedZoneId,
      total: summary.total,
      occupied: summary.occupied,
      free: summary.free,
    });

    return {
      zoneId:
        toNullableString(pick<string>(effective, ["zone", "zoneId", "zone_id", "zoneCode"]))
          ?.toUpperCase() ?? normalizedZoneId,
      summary,
    };
  } catch {
    debugLog("Failed to load public zone summary", { zoneId });
    return null;
  }
}

export async function getPublicCameraSummary(
  cameraId: string,
): Promise<PublicCameraSummary | null> {
  try {
    const url = `${PUBLIC_API_BASE}/cameras/${encodeURIComponent(cameraId)}`;
    const raw = await fetchJson(url);
    const payload = asObject(unwrapPayload(raw));
    const nestedCamera = asObject(pick<unknown>(payload, ["camera", "result", "latestResult"]));
    const effective = Object.keys(payload).length > 0 ? payload : nestedCamera;

    const summary = {
      zoneId:
        toNullableString(pick<string>(effective, ["zone", "zoneId", "zone_id", "zoneCode"]))
          ?.toUpperCase() ?? "C5",
      timestamp: toNullableString(
        pick<string>(effective, ["timestamp", "updatedAt", "processedAt", "createdAt"]),
      ),
      snapLink: toNullableString(
        pick<string>(effective, ["snap_link", "snapLink", "snapshotUrl", "snapshot"]),
      ),
    };

    debugLog("Loaded public camera summary", {
      url,
      cameraId,
      zoneId: summary.zoneId,
      hasTimestamp: summary.timestamp !== null,
      hasSnapshot: summary.snapLink !== null,
    });

    return summary;
  } catch {
    debugLog("Failed to load public camera summary", { cameraId });
    return null;
  }
}

export async function getPublicCameraSlots(
  cameraId: string,
): Promise<ParkingSubZone[] | null> {
  try {
    const url = `${PUBLIC_API_BASE}/cameras/${encodeURIComponent(cameraId)}/slots`;
    const payload = await fetchJson(url);
    const list = extractList(unwrapPayload(payload));
    const slots = list.map((item, index) => mapPublicSlotToParkingSubZone(item, index));

    debugLog("Loaded public camera slots", {
      url,
      cameraId,
      rawCount: list.length,
      mappedCount: slots.length,
      occupiedCount: slots.filter((slot) => slot.occupied > 0).length,
    });

    return slots;
  } catch {
    debugLog("Failed to load public camera slots", { cameraId });
    return null;
  }
}

export async function getC5CameraSummary(): Promise<PublicCameraSummary | null> {
  return getPublicCameraSummary(C5_CAMERA_ID);
}

export async function getC5CameraSlots(): Promise<ParkingSubZone[] | null> {
  return getPublicCameraSlots(C5_CAMERA_ID);
}
