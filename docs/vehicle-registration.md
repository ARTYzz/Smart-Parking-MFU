# Vehicle registration demo

`/my-vehicle` supports plate, registration province, brand, body category and one ownership-evidence attachment (JPEG, PNG or PDF, non-empty, up to 5 MiB). Use sample documents during development.

`lib/services/vehicles.ts` defines the service contract and browser IndexedDB adapter. Each operation rechecks the current authenticated user; queries and deletion are scoped to that user. A unique compound index prevents duplicate plate/province records for the same account. Files are stored as blobs with the vehicle and deleted with it. Browser storage is local, not a security boundary against someone with access to that browser profile. It is not synchronized across devices or submitted to an admin.

New requests always receive `pending`. The data contract includes `approved`, `rejected`, `reviewedAt` and `reviewNote` for future review. There is deliberately no user-facing approval control. The current booking flow does not require an approved vehicle yet. A pending request may be deleted and resubmitted with corrections.

For production, replace the adapter with authenticated server endpoints, a vehicles table protected by ownership RLS, private evidence storage with short-lived signed access, server-side MIME/content and size validation, and admin-only review transitions with an audit log. Do not expose evidence in a public bucket. Decide university document requirements, retention and booking eligibility before enabling real submissions. The existing parking-demo reset does not remove vehicle documents; use Delete request or clear the browser's site storage.

Manual acceptance: register using a sample document; reload; check persistence; download the attachment; try duplicate plate/province; verify another signed-in account sees only its own records; cancel and confirm deletion; switch Thai/English. Admin review remains a future implementation.
