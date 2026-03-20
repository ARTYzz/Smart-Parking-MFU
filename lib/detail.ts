import type { ParkingSubZone } from "@/types/parking";
import { mockParkingDetailsByZone } from "@/lib/mock-detail-data";

export function getMockParkingDetailsByZone(zoneId: string): ParkingSubZone[] {
  return mockParkingDetailsByZone[zoneId] ?? [];
}
