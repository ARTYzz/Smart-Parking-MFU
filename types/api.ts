export interface ParkingZoneApiResponse {
  row_number: number;
  timestamp: string;
  zone: string;
  total: number | string;
  occupied: number | string;
  free: number | string;
  skipped: number | string;
  "mt-occ": number | string;
  "mt-free": number | string;
  "car-occ": number | string;
  "car-free": number | string;
  snap_link: string;
}

export interface ParkingDetailApiResponse {
  row_number: number;
  timestamp: string;
  zone: string;
  total: number | string;
  occupied: number | string;
  free: number | string;
  skipped: number | string;
  "motercycle-occ": number | string;
  "motocycle-free": number | string;
  "car-occ": number | string;
  "car-free": number | string;
  snap_link: string;
}
