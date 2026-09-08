let queue: Promise<unknown> = Promise.resolve();
/** Shared lock for mock booking and notification ledger writes. */
export async function transaction<T>(work: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) return await navigator.locks.request("mfu-demo-bookings", work);
  const result = queue.then(work, work);
  queue = result.catch(() => undefined);
  return result;
}
