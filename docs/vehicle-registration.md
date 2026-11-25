# Vehicle registration

Set `NEXT_PUBLIC_PARKING_MODE=api` and configure the same server-only `PARKING_USER_API_KEY` in Smart Parking MFU and Admin. `PARKING_ADMIN_BASE_URL` optionally overrides the production Admin origin. After deploying both projects, sign in with a university account and submit a sample JPEG, PNG or PDF up to 3 MiB. In Admin, review it under **Vehicle Approvals**. In Smart Parking MFU, click **Refresh status** to see the decision and rejection reason. Each account can see only its own requests.

## Demo mode

`/my-vehicle` supports plate, registration province, brand, body category and one ownership-evidence attachment (JPEG, PNG or PDF, non-empty, up to 5 MiB). Use sample documents during development.

`lib/services/vehicles.ts` defines the service contract and browser IndexedDB adapter. Each operation rechecks the current authenticated user; queries and deletion are scoped to that user. A unique compound index prevents duplicate plate/province records for the same account. Files are stored as blobs with the vehicle and deleted with it. Browser storage is local, not a security boundary against someone with access to that browser profile. It is not synchronized across devices or submitted to an admin.

New requests always receive `pending`. The data contract includes `approved`, `rejected`, `reviewedAt` and `reviewNote` for future review. There is deliberately no user-facing approval control. The current booking flow does not require an approved vehicle yet. A pending request may be deleted and resubmitted with corrections.

Demo requests remain in the browser when API mode is enabled. The parking-demo reset leaves them in place. Use **Delete request** in demo mode or clear the browser's site storage to remove them.

Manual acceptance: register using a sample document; reload; check persistence; download the attachment; try duplicate plate/province; verify another signed-in account sees only its own records; cancel and confirm deletion; switch Thai/English. Admin review remains a future implementation.
