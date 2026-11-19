import { getParkingZoneDetails, getPublicZones } from "@/lib/api";
import type { AppUser, AuthService, BookingService, ParkingService, NotificationService } from "./contracts";
import { mockNotificationService } from "./notifications";
import { mockBookingService, demoBookingPolicies } from "./booking";
import { bindMockUser, mockParkingService } from "./mock";

export const parkingMode = process.env.NEXT_PUBLIC_PARKING_MODE === "api" ? "api" : "mock";
export const authMode = "google";
// Real data failures remain visible; never silently substitute demo data in API mode.
const apiParkingService: ParkingService = {
  listZones: getPublicZones,
  getDetails: getParkingZoneDetails,
};
let pendingSession: Promise<AppUser | null> | null = null;
async function fetchSession(): Promise<AppUser | null> {
    const response = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error("ตรวจสอบบัญชีไม่สำเร็จ");
    const { user } = await response.json();
    bindMockUser(user);
    return user;
}
const googleAuthService: AuthService = {
  getSession() {
    // Share only an in-flight request; never cache an authenticated result across requests.
    if (!pendingSession) pendingSession = fetchSession().finally(() => { pendingSession = null; });
    return pendingSession;
  },
  async signIn() { window.location.assign("/api/auth/google"); return null; },
  async signOut() {
    await pendingSession?.catch(() => {});
    const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    if (!response.ok) throw new Error("ออกจากระบบไม่สำเร็จ");
    bindMockUser(null);
    window.location.replace("/login");
  },
};
export const parkingService = parkingMode === "mock" ? mockParkingService : apiParkingService;
export const authService = googleAuthService;
export const bookingEnabled = parkingMode === "mock";
const unavailableBookingService: BookingService = {
  getPolicy: role => ({ ...demoBookingPolicies[role] }),
  async getSnapshot() { return { bookings: [], events: [], availability: [] }; },
  async getAvailableSlots() { throw new Error("รอเชื่อมบริการจองจริง"); },
  async create() { throw new Error("รอเชื่อมบริการจองจริง"); },
  async cancel() { throw new Error("รอเชื่อมบริการจองจริง"); },
};
export const bookingService = bookingEnabled ? mockBookingService : unavailableBookingService;
const unavailableNotificationService: NotificationService = {
  async getSnapshot() { return { userId: null, notifications: [], followedZoneIds: [] }; },
  async markRead() { throw new Error("รอเชื่อมบริการแจ้งเตือนจริง"); },
  async markAllRead() { throw new Error("รอเชื่อมบริการแจ้งเตือนจริง"); },
  async followZone() { throw new Error("รอเชื่อมบริการแจ้งเตือนจริง"); },
};
export const notificationService = bookingEnabled ? mockNotificationService : unavailableNotificationService;
