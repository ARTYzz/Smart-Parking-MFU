import { getParkingZoneDetails, getPublicZones } from "@/lib/api";
import type { AuthService, BookingService, ParkingService, NotificationService } from "./contracts";
import { mockNotificationService } from "./notifications";
import { mockBookingService, demoBookingPolicies } from "./booking";
import { mockAuthService, mockParkingService } from "./mock";

export const parkingMode = process.env.NEXT_PUBLIC_PARKING_MODE === "api" ? "api" : "mock";
export const authMode = process.env.NEXT_PUBLIC_AUTH_MODE === "reg" ? "reg" : "mock";
// Real data failures remain visible; never silently substitute demo data in API mode.
const apiParkingService: ParkingService = {
  listZones: getPublicZones,
  getDetails: getParkingZoneDetails,
};
const regAuthService: AuthService = {
  async getSession() { return null; },
  async signIn() { throw new Error("ยังไม่ได้เชื่อมระบบ REG ของมหาวิทยาลัย"); },
  async signOut() { throw new Error("ยังไม่ได้เชื่อมระบบ REG ของมหาวิทยาลัย"); },
};
export const parkingService = parkingMode === "mock" ? mockParkingService : apiParkingService;
export const authService = authMode === "mock" ? mockAuthService : regAuthService;
export const bookingEnabled = parkingMode === "mock" && authMode === "mock";
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
