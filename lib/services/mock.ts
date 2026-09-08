import type { ParkingSubZone, ParkingZone } from "@/types/parking";
import { calculateOccupancyRate, getParkingStatus } from "@/lib/occupancy";
import { zoneCatalog } from "./catalog";
import type { AppUser, AuthService, ParkingService, Booking, BookingEvent, AppNotification, ZoneWatch } from "./contracts";

export const demoAccounts: AppUser[] = [
  { id: "demo-student", name: "นักศึกษาสาธิต", role: "student" },
  { id: "demo-staff", name: "บุคลากรสาธิต", role: "staff" },
  { id: "demo-lecturer", name: "อาจารย์สาธิต", role: "lecturer" },
  { id: "demo-admin", name: "ผู้ดูแลสาธิต", role: "admin" },
];
export const demoStorageKey = "mfu-parking-demo-v1";
type Scenario = "normal" | "full" | "no-data";
export type DemoState = { accountId: string | null; scenario: Scenario; updatedAt: string; bookings: Booking[]; events: BookingEvent[]; notifications: AppNotification[]; watches: ZoneWatch[] };
let memory: DemoState = { accountId: null, scenario: "normal", updatedAt: "2026-09-09T08:00:00+07:00", bookings: [], events: [], notifications: [], watches: [] };

export function readDemo(): DemoState {
  if (typeof window === "undefined") return memory;
  try {
    const raw = JSON.parse(localStorage.getItem(demoStorageKey) ?? "null");
    if (raw && ["normal", "full", "no-data"].includes(raw.scenario) &&
      (raw.accountId === null || demoAccounts.some(a => a.id === raw.accountId)) &&
      typeof raw.updatedAt === "string" && Number.isFinite(Date.parse(raw.updatedAt))) {
      // Migrate the first mock-foundation storage format without dropping the selected account.
      const bookings = Array.isArray(raw.bookings) ? raw.bookings.filter(validBooking) : [];
      const events = Array.isArray(raw.events) ? raw.events.filter(validEvent) : [];
      const notifications = Array.isArray(raw.notifications) ? raw.notifications.filter(validNotification) : [];
      const watches = Array.isArray(raw.watches) ? raw.watches.filter(validWatch) : [];
      memory = { accountId: raw.accountId, scenario: raw.scenario, updatedAt: raw.updatedAt, bookings, events, notifications, watches };
    }
  } catch { /* Storage unavailable or corrupt: keep a usable in-memory demo. */ }
  return memory;
}
function validBooking(value: unknown): value is Booking {
  if (!value || typeof value !== "object") return false;
  const b = value as Booking;
  return [b.id, b.userId, b.zoneId, b.slotId].every(v => typeof v === "string") &&
    [b.startsAt, b.expiresAt, b.createdAt].every(v => typeof v === "string" && Number.isFinite(Date.parse(v))) &&
    Date.parse(b.expiresAt) > Date.parse(b.startsAt) &&
    ["car", "motorcycle"].includes(b.vehicleType) && ["confirmed", "cancelled", "expired"].includes(b.status);
}
function validEvent(value: unknown): value is BookingEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as BookingEvent;
  return [event.id, event.bookingId, event.userId, event.slotId].every(v => typeof v === "string") &&
    ["created", "cancelled", "expired"].includes(event.type) && Number.isFinite(Date.parse(event.timestamp));
}
function validNotification(value: unknown): value is AppNotification {
  if (!value || typeof value !== "object") return false;
  const n = value as AppNotification;
  return [n.id, n.userId, n.title, n.body].every(v => typeof v === "string") &&
    ["booking-created", "booking-cancelled", "booking-expired", "booking-ending", "zone-nearly-full", "zone-full"].includes(n.type) &&
    Number.isFinite(Date.parse(n.createdAt)) && (n.readAt === null || Number.isFinite(Date.parse(n.readAt))) &&
    (n.zoneId === undefined || typeof n.zoneId === "string") && (n.bookingId === undefined || typeof n.bookingId === "string");
}
function validWatch(value: unknown): value is ZoneWatch {
  if (!value || typeof value !== "object") return false;
  const w = value as ZoneWatch;
  return demoAccounts.some(a => a.id === w.userId) && zoneCatalog.some(z => z.id === w.zoneId) &&
    [null, "available", "nearly-full", "full"].includes(w.lastStatus);
}
export function writeDemo(state: DemoState) {
  memory = state;
  try { localStorage.setItem(demoStorageKey, JSON.stringify(state)); } catch { /* Session-only fallback. */ }
}
export function setDemoScenario(scenario: Scenario) {
  writeDemo({ ...readDemo(), scenario, updatedAt: new Date().toISOString() });
}
export function resetDemo() {
  writeDemo({ accountId: null, scenario: "normal", updatedAt: new Date().toISOString(), bookings: [], events: [], notifications: [], watches: [] });
}
export const mockParkingService: ParkingService = {
  async listZones() {
    const state = readDemo();
    return zoneCatalog.map((zone, i): ParkingZone => {
      const hasData = state.scenario !== "no-data";
      const rate = state.scenario === "full" ? 1 : zone.occupied;
      const carOccupied = hasData ? Math.floor(zone.car * rate) : 0;
      const motorcycleOccupied = hasData ? Math.floor(zone.motorcycle * rate) : 0;
      const total = hasData ? zone.car + zone.motorcycle : 0;
      const occupied = carOccupied + motorcycleOccupied;
      return {
        id: zone.id, name: `โซน ${zone.id}`, rowNumber: i + 1,
        total, occupied, free: total - occupied, skipped: 0,
        car: { occupied: carOccupied, free: hasData ? zone.car - carOccupied : 0 },
        motorcycle: { occupied: motorcycleOccupied, free: hasData ? zone.motorcycle - motorcycleOccupied : 0 },
        timestamp: hasData ? state.updatedAt : null, snapLink: null, hasData,
        occupancyRate: calculateOccupancyRate(occupied, total), status: getParkingStatus(hasData, occupied, total),
      };
    });
  },
  async getDetails(zoneId) {
    const zone = (await this.listZones()).find(z => z.id === zoneId.toUpperCase());
    if (!zone || !zone.hasData) return [];
    const slots: ParkingSubZone[] = [];
    for (const vehicle of ["car", "motorcycle"] as const) {
      const stats = zone[vehicle];
      for (let i = 0; i < stats.occupied + stats.free; i++) {
        const occupied = i < stats.occupied ? 1 : 0;
        const id = `${zone.id}-${vehicle === "car" ? "C" : "M"}${String(i + 1).padStart(3, "0")}`;
        slots.push({ ...zone, id, name: id, rowNumber: slots.length + 1, total: 1,
          occupied, free: 1 - occupied, occupancyRate: occupied,
          car: vehicle === "car" ? { occupied, free: 1 - occupied } : { occupied: 0, free: 0 },
          motorcycle: vehicle === "motorcycle" ? { occupied, free: 1 - occupied } : { occupied: 0, free: 0 },
          status: getParkingStatus(true, occupied, 1) });
      }
    }
    return slots;
  },
};
export const mockAuthService: AuthService = {
  async getSession() { return demoAccounts.find(a => a.id === readDemo().accountId) ?? null; },
  async signIn(accountId) {
    const account = demoAccounts.find(a => a.id === accountId);
    if (!account) throw new Error("ไม่พบบัญชีสาธิต");
    writeDemo({ ...readDemo(), accountId: account.id });
    return account;
  },
  async signOut() { writeDemo({ ...readDemo(), accountId: null }); },
};
