"use client";
import { ParkingPlan } from "./parking-plan";
import type { ParkingSubZone } from "@/types/parking";
export function C2ParkingPlan({ slots }: { slots: ParkingSubZone[] }) {
  return <ParkingPlan zoneId="C2" slots={slots} />;
}
