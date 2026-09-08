# Mock parking and booking

The default app uses demonstration parking data and accounts only. No REG or camera connection is required. Existing `.env.local` endpoints do not opt into live mode.

## Architecture

- `lib/services/contracts.ts`: parking, auth and booking interfaces; typed requests, policies, availability and events. UI calls `bookingService` rather than writing browser storage.
- `lib/services/catalog.ts`: canonical zone IDs and illustrative capacities/positions.
- `lib/services/mock.ts`: physical occupancy, individual slots, session and versioned browser state (`mfu-parking-demo-v1`). Earlier state is migrated to an empty booking ledger without dropping the account/scenario. Storage failure falls back to memory; persistence across reload then cannot be guaranteed.
- `lib/services/booking.ts`: mock policy validation, slot assignment, interval conflicts, cancellation, expiry reconciliation and per-user events. The clock is injectable for deterministic expiry tests.
- `lib/services/index.ts`: independent parking/auth adapters. Booking is available only when both are mock; real modes intentionally do not create local reservations.
- `AppProvider`: shared data, one-second booking/countdown refresh, focus refresh and cross-tab storage synchronization.

## Demonstration policy (not university policy)

| Role | Outstanding bookings, including future | Max duration | Advance start window |
| --- | --- | --- | --- |
| Student | 1 | 60 minutes | 24 hours |
| Staff | 2 | 120 minutes | 48 hours |
| Lecturer | 2 | 180 minutes | 72 hours |
| Admin | 2 | 180 minutes | 72 hours |

Minimum duration is 5 minutes. Every role is subject to personal time-overlap checks, even when booking a different vehicle or zone. No admin bypass is provided. Intervals are half-open `[start, end)`, allowing adjacent bookings to reuse a slot. Cancel any confirmed booking before its end. Expiry releases both inventory and quota. These rules are initial demo choices, not REG-derived permissions.

## Inventory semantics

`occupied` / `free` always describe simulated physical vehicle presence. Reservations never change them. Current `reserved` counts slots held by confirmed bookings whose interval contains now. `bookable` counts physically free slots excluding current reservations, so an occupied-and-reserved slot is never subtracted twice. The map color/count uses bookable inventory; vehicle statistics remain physical occupancy. A future booking blocks only an overlapping requested interval and becomes a current reservation when its start arrives.

The demo assumes physical occupancy stays constant across the selected interval; it does not predict a currently parked vehicle's departure. Full/no-data scenarios prevent new reservations but preserve existing reservations and history. Existing bookings may conflict with a manually changed scenario: the reservation badge remains visible while bookable inventory is clamped by actual free slots.

## Persistence and concurrency

Bookings and created/cancelled/expired events are persisted with the demo session. Switching accounts filters My Booking and History but does not delete previous users' reservations. Countdown uses absolute timestamps, so background time, reload and reopening after expiry work correctly. Expiry events are recorded once with the actual expiration timestamp. Demo reset removes bookings/events as well as resetting scenario/account.

Web Locks serialize booking transactions and expiry writes between tabs on supported secure origins (including localhost). A same-tab queue is the fallback; without Web Locks, multi-tab atomicity is not guaranteed. Browser storage is not a database and is not shared across devices. The shared demo account follows account changes in other tabs; mutations reject a stale caller identity.

## Future integration

Implement BookingService against server endpoints with an authoritative clock, authenticated session, database transactions/unique constraints and server-approved policies. The backend must recheck inventory and ownership regardless of what the UI shows. Do not trust client-selected roles or localStorage for real authorization.

Set `NEXT_PUBLIC_PARKING_MODE=api` and configure the public zones base/details endpoint to use the existing mappers; reconcile those with the professor's final contract. Browser requests require CORS support or a same-origin server adapter. Never place credentials in NEXT_PUBLIC variables. API failures never silently fall back to mock data.

`NEXT_PUBLIC_AUTH_MODE=reg` disables mock login and shows REG unavailable until a server-verified university session adapter is implemented. Restart/rebuild when changing NEXT_PUBLIC settings.

## Verification

`npm test` exercises inventory conservation, policies, interval boundaries, quota, ownership, account isolation, reload, reset, expiry, full/no-data states and concurrent submissions. `npm run lint` and `npm run build` check the app.

Manual flow: select a demo account → `/find-spot` → choose vehicle/zone/start/duration → confirm → `/my-booking` → cancel or let expire → `/history`. Compare the physical and bookable counts on Dashboard and zone details before/after. Repeat with a future start and another account. Test invalid past dates, duration above policy, overlapping bookings and a full zone.

Schedule integration, credit scoring, analytics, prediction and PWA remain future iterations. Booking history is not evidence that a vehicle actually entered a parking space.

## In-app notifications

`NotificationService` (`lib/services/notifications.ts`) generates persisted per-user messages from booking events, the final five minutes of an active reservation, and followed-zone transitions. `/notifications` provides unread/all filters, mark-read/mark-all, and zone following. The header bell shows the signed-in account's unread count. These APIs are disabled alongside mock booking in real-data/REG modes until a real notification adapter is implemented.

Booking-event IDs and one stable reminder ID per booking deduplicate repeated polling and reload. A five-minute booking can immediately generate its ending reminder at its start. Future bookings never trigger early; reopening after expiry produces the expiry message without a stale five-minute reminder. Read status and followed zones survive reload and are included in demo reset. Existing booking events are migrated into messages on first opening the new version.

Zone warnings use bookable capacity including current reservations, matching the map. Following an already-nearly-full/full zone sends one initial warning. Only subsequent status changes re-alert; recovery to available allows a later warning, while no-data retains the last known status to avoid false repeated alerts. Unfollowing stops future zone messages but preserves existing history. Monitoring works while the app is open and can compare the current status on reopening; it cannot reconstruct missed transitions while closed.

Notifications are in-app only: no browser permission, push, email, or external account is used. A production adapter will need authenticated ownership checks, server-side scheduling/event delivery, and push integration with the later PWA. Shared Web Locks protect notification and booking writes; the existing same-tab fallback applies where Web Locks is unavailable.


## Header account controls

The top-right avatar opens a modal right-side account drawer with personal navigation, demo account switching and sign-out. Native dialog focus containment, Escape dismissal, backdrop dismissal and focus return are supported. Personal account actions have moved out of the demo banner.

The adjacent icon-only bell opens an in-page dropdown with the latest six messages, individual/all read actions, empty/error/guest states and optional links to details or the full notification center. Clicking the bell does not navigate; Escape and outside clicks dismiss the dropdown. Profile and notification panels are mutually exclusive.
