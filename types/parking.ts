export type VehicleType = "car" | "motorcycle";

export type ParkingStatus = "available" | "nearly-full" | "full" | "no-data";

export interface VehicleStats {
  occupied: number;
  free: number;
}

export interface ParkingZone {
  id: string;
  name: string;
  rowNumber: number;
  timestamp: string | null;
  total: number;
  occupied: number;
  free: number;
  skipped: number;
  car: VehicleStats;
  motorcycle: VehicleStats;
  snapLink: string | null;
  hasData: boolean;
  occupancyRate: number;
  status: ParkingStatus;
}

export interface ParkingSubZone {
  id: string;
  name: string;
  rowNumber: number;
  timestamp: string | null;
  total: number;
  occupied: number;
  free: number;
  skipped: number;
  car: VehicleStats;
  motorcycle: VehicleStats;
  snapLink: string | null;
  hasData: boolean;
  occupancyRate: number;
  status: ParkingStatus;
}

export interface ParkingSummary {
  total: number;
  occupied: number;
  free: number;
  skipped: number;
  car: VehicleStats;
  motorcycle: VehicleStats;
}
