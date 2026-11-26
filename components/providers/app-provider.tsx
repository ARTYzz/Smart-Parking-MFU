"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { ParkingZone } from "@/types/parking";
import type { AppUser, BookingSnapshot, NotificationSnapshot } from "@/lib/services/contracts";
import { authService, parkingMode, parkingService, bookingService, notificationService } from "@/lib/services";
import { demoStorageKey } from "@/lib/services/mock";

const AppContext = createContext<{
  zones: ParkingZone[]; user: AppUser | null; loading: boolean; error: string;
  bookingSnapshot: BookingSnapshot; bookingError: string; now: number;
  notificationSnapshot: NotificationSnapshot; notificationError: string; refreshNotifications: () => Promise<void>;
  refresh: () => Promise<void>; signIn: (id?: string) => Promise<void>; signOut: () => Promise<void>;
} | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const currentUser = useRef<AppUser | null>(null);
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
    const userId = currentUser.current?.id;
    try {
      const next = await notificationService.getSnapshot();
      if (currentUser.current?.id !== userId) return;
      setNotificationSnapshot(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      setNotificationError("");
    } catch {
      if (currentUser.current?.id !== userId) return;
      setNotificationSnapshot({ userId: null, notifications: [], followedZoneIds: [] });
      setNotificationError("โหลดการแจ้งเตือนไม่สำเร็จ กรุณาลองใหม่");
    }
  }, []);
  const refresh = useCallback(async () => {
    let session: AppUser | null;
    try { session = await authService.getSession(); }
    catch { currentUser.current = null; setUser(null); setError("ตรวจสอบบัญชีไม่สำเร็จ กรุณาลองใหม่"); setLoading(false); return; }
    currentUser.current = session;
    setUser(previous => JSON.stringify(previous) === JSON.stringify(session) ? previous : session);
    if (!session) {
      setZones([]); setBookingSnapshot({ bookings: [], events: [], availability: [] });
      setNotificationSnapshot({ userId: null, notifications: [], followedZoneIds: [] });
      setError(""); setLoading(false); return;
    }
    const [parking, booking] = await Promise.allSettled([parkingService.listZones(), bookingService.getSnapshot()]);
    if (currentUser.current?.id !== session.id) return;
    setZones(previous => parking.status === "fulfilled" && JSON.stringify(previous) === JSON.stringify(parking.value) ? previous : parking.status === "fulfilled" ? parking.value : []);
    setError(parking.status === "rejected" ? "โหลดข้อมูลที่จอดไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่" : "");
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
    const sync = (event: StorageEvent) => {
      if (event.key !== demoStorageKey && event.key !== null) return;
      try {
        const next = event.newValue ? JSON.parse(event.newValue) : null;
        if (!next || next.accountId !== currentUser.current?.id) { void refresh(); return; }
        // Booking/notification writes in another tab are not authentication changes.
        void parkingService.listZones().then(zones => setZones(previous => JSON.stringify(previous) === JSON.stringify(zones) ? previous : zones)).catch(() => {});
      } catch { void refresh(); }
    };
    window.addEventListener("storage", sync);
    const focus = () => { if (document.visibilityState !== "hidden") void refresh(); };
    window.addEventListener("focus", focus);
    const sessionTimer = setInterval(focus, 60_000);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("focus", focus); clearInterval(sessionTimer); };
  }, [refresh]);
  useEffect(() => {
    if (!user) return;
    let active = true;
    let running = false;
    const tick = async () => {
      if (running || document.visibilityState === "hidden") return;
      running = true;
      setNow(Date.now());
      try {
        const snapshot = await bookingService.getSnapshot();
        if (active) { setBookingSnapshot(previous => JSON.stringify(previous) === JSON.stringify(snapshot) ? previous : snapshot); setBookingError(""); }
      } catch { if (active) setBookingError("โหลดการจองไม่สำเร็จ กรุณาลองใหม่"); }
      if (active) await refreshNotifications();
      running = false;
    };
    const timer = setInterval(() => void tick(), parkingMode === "mock" ? 1000 : 20_000);
    const clock = setInterval(() => { if (document.visibilityState !== "hidden") setNow(Date.now()); }, 1000);
    return () => { active = false; clearInterval(timer); clearInterval(clock); };
  }, [refreshNotifications, user]);
  async function signIn(id?: string) { await authService.signIn(id); await refresh(); }
  async function signOut() { await authService.signOut(); await refresh(); }
  return <AppContext.Provider value={{ zones, user, loading, error, refresh, signIn, signOut, bookingSnapshot, bookingError, now, notificationSnapshot, notificationError, refreshNotifications }}>{children}</AppContext.Provider>;
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppProvider is required");
  return context;
}
