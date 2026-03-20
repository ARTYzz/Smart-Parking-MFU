import type {
  ParkingDetailApiResponse,
  ParkingZoneApiResponse,
} from "@/types/api";
import type { ParkingSubZone, ParkingZone } from "@/types/parking";
import {
  mapDetailApiToParkingSubZone,
  mapZoneApiToParkingZone,
} from "@/lib/mappers";

const ZONES_API = process.env.NEXT_PUBLIC_ZONES_API;
const DETAILS_API = process.env.NEXT_PUBLIC_DETAILS_API;

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
