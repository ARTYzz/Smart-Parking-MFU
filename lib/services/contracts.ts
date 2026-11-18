import type { ParkingSubZone, ParkingZone, VehicleType } from "@/types/parking";

export type UserRole = "student" | "staff" | "lecturer" | "admin";
export interface AppUser { id: string; name: string; role: UserRole; email?: string }
export interface ParkingService {
  listZones(): Promise<ParkingZone[]>;
  getDetails(zoneId: string): Promise<ParkingSubZone[]>;
}
/** Implement with a server-verified REG session when the university contract is available. */
export interface AuthService {
  getSession(): Promise<AppUser | null>;
  signIn(accountId?: string): Promise<AppUser | null>;
  signOut(): Promise<void>;
}
export interface Booking {
  id: string; userId: string; zoneId: string; slotId: string;
  vehicleType: VehicleType; createdAt: string;
  startsAt: string; expiresAt: string;
  status: "confirmed" | "cancelled" | "expired";
}
export interface BookingPolicy { role: UserRole; maxActiveBookings: number; maxMinutes: number; advanceHours: number }
export interface BookingRequest {
  userId: string; zoneId: string; vehicleType: VehicleType;
  /** null means start now, resolved atomically when confirming. */
  startsAt: string | null; durationMinutes: number;
}
export interface BookingEvent {
  id: string; bookingId: string; userId: string; slotId: string;
  type: "created" | "cancelled" | "expired"; timestamp: string;
}
export interface BookingAvailability {
  zoneId: string; reserved: number; bookable: number;
  carBookable: number; motorcycleBookable: number; reservedSlotIds: string[];
}
export interface BookingSnapshot {
  bookings: Booking[]; events: BookingEvent[]; availability: BookingAvailability[];
}
export interface BookingService {
  getPolicy(role: UserRole): BookingPolicy;
  getSnapshot(): Promise<BookingSnapshot>;
  getAvailableSlots(request: Pick<BookingRequest, "zoneId" | "vehicleType" | "startsAt" | "durationMinutes">): Promise<string[]>;
  create(request: BookingRequest): Promise<Booking>;
  cancel(bookingId: string, userId: string): Promise<void>;
}
export interface ScheduleEntry { id: string; userId: string; buildingId: string; startsAt: string; endsAt: string }
export type NotificationType = "booking-created" | "booking-cancelled" | "booking-expired" | "booking-ending" | "zone-nearly-full" | "zone-full";
export interface AppNotification {
  id: string; userId: string; type: NotificationType; title: string; body: string;
  createdAt: string; readAt: string | null; zoneId?: string; bookingId?: string;
}
export interface ZoneWatch {
  userId: string; zoneId: string; lastStatus: "available" | "nearly-full" | "full" | null;
}
export interface NotificationSnapshot { userId: string | null; notifications: AppNotification[]; followedZoneIds: string[] }
export interface NotificationService {
  getSnapshot(): Promise<NotificationSnapshot>;
  markRead(id: string, userId: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  followZone(zoneId: string, follow: boolean, userId: string): Promise<void>;
}
