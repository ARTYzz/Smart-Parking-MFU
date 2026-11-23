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

## Switching the app to API data

Keep `NEXT_PUBLIC_PARKING_MODE=mock` until the camera endpoints are known. In API mode, the parking service reads `NEXT_PUBLIC_ZONES_API`, or `NEXT_PUBLIC_PUBLIC_API_BASE/zones` when no explicit zones URL is set. Set `NEXT_PUBLIC_DETAILS_API` to the detail endpoint. The adapter adds the `zone` query parameter while retaining other parameters.

When the provider contract arrives, confirm response examples for both endpoints, zone IDs, whether details are individual slots or aggregate rows, and the timestamp format. Browser requests to another origin need CORS or a same-origin backend. Failed API requests surface as errors, and booking stays unavailable in API mode until a reservation backend exists.

## Notes
- Detail API currently contains typo fields:
  - `motercycle-occ`
  - `motocycle-free`
- Frontend handles normalization through mapper layer.