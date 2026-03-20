# MFU Smart Parking API Contract

## Zones API
- Method: GET
- Env: `NEXT_PUBLIC_ZONES_API`
- Expected response: `ParkingZoneApiResponse[]`

## Details API
- Method: GET
- Env: `NEXT_PUBLIC_DETAILS_API`
- Query: `?zone={id}`
- Expected response: `ParkingDetailApiResponse[]`

## Notes
- Detail API currently contains typo fields:
  - `motercycle-occ`
  - `motocycle-free`
- Frontend handles normalization through mapper layer.