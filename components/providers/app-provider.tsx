"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { ParkingZone } from "@/types/parking";
import type { AppUser, BookingSnapshot, NotificationSnapshot } from "@/lib/services/contracts";
import { authService, parkingService, bookingService, notificationService } from "@/lib/services";
import { demoStorageKey } from "@/lib/services/mock";

const AppContext = createContext<{
  zones: ParkingZone[]; user: AppUser | null; loading: boolean; error: string;
  bookingSnapshot: BookingSnapshot; bookingError: string; now: number;
  notificationSnapshot: NotificationSnapshot; notificationError: string; refreshNotifications: () => Promise<void>;
  refresh: () => Promise<void>; signIn: (id?: string) => Promise<void>; signOut: () => Promise<void>;
} | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSnapshot, setBookingSnapshot] = useState<BookingSnapshot>({ bookings: [], events: [], availability: [] });
  const [bookingError, setBookingError] = useState("");
  const [now, setNow] = useState(0);
  const [notificationSnapshot, setNotificationSnapshot] = useState<NotificationSnapshot>({ userId: null, notifications: [], followedZoneIds: [] });
  const [notificationError, setNotificationError] = useState("");
  const refreshNotifications = useCallback(async () => {
    try { setNotificationSnapshot(await notificationService.getSnapshot()); setNotificationError(""); }
    catch { setNotificationSnapshot({ userId: null, notifications: [], followedZoneIds: [] }); setNotificationError("โหลดการแจ้งเตือนไม่สำเร็จ กรุณาลองใหม่"); }
  }, []);
  const refresh = useCallback(async () => {
    const [parking, session, booking] = await Promise.allSettled([parkingService.listZones(), authService.getSession(), bookingService.getSnapshot()]);
    setZones(parking.status === "fulfilled" ? parking.value : []);
    setUser(session.status === "fulfilled" ? session.value : null);
    setError(parking.status === "rejected" ? "โหลดข้อมูลที่จอดไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่" : session.status === "rejected" ? "โหลดบัญชีไม่สำเร็จ" : "");
    setLoading(false);
    setNow(Date.now());
    setBookingSnapshot(booking.status === "fulfilled" ? booking.value : { bookings: [], events: [], availability: [] });
    setBookingError(booking.status === "rejected" ? "โหลดการจองไม่สำเร็จ" : "");
    await refreshNotifications();
  }, [refreshNotifications]);
  useEffect(() => {
    // refresh awaits both external services before committing state; no synchronous update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const sync = (event: StorageEvent) => { if (event.key === demoStorageKey || event.key === null) void refresh(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [refresh]);
  useEffect(() => {
    let active = true;
    const tick = async () => {
      setNow(Date.now());
      try {
        const snapshot = await bookingService.getSnapshot();
        if (active) { setBookingSnapshot(snapshot); setBookingError(""); }
      } catch { if (active) setBookingError("โหลดการจองไม่สำเร็จ กรุณาลองใหม่"); }
      if (active) await refreshNotifications();
    };
    const timer = setInterval(() => void tick(), 1000);
    window.addEventListener("focus", tick);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", tick); };
  }, [refreshNotifications]);
  async function signIn(id?: string) { await authService.signIn(id); await refresh(); }
  async function signOut() { await authService.signOut(); await refresh(); }
  return <AppContext.Provider value={{ zones, user, loading, error, refresh, signIn, signOut, bookingSnapshot, bookingError, now, notificationSnapshot, notificationError, refreshNotifications }}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppProvider is required");
  return context;
}
