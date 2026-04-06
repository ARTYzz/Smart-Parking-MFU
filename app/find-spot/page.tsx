"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Bike,
  Car,
  Check,
  Gauge,
  History,
  Info,
  LogOut,
  MapPinned,
  Navigation,
  Settings,
  UserCircle2,
} from "lucide-react";
import { mockParkingZones } from "@/lib/mock-data";

type VehicleType = "car" | "motorcycle";

type ZoneMapItem = {
  id: string;
  available: number;
  vehicleAvailable: number;
  x: string;
  y: string;
};

const zonePositionMap: Record<string, { x: string; y: string }> = {
  A: { x: "10%", y: "18%" },
  B: { x: "48%", y: "12%" },
  C1: { x: "73%", y: "38%" },
  D: { x: "24%", y: "62%" },
};

const sideMenuTop = [
  { id: "dashboard", label: "Dashboard", icon: Gauge, href: "/" },
  {
    id: "quick",
    label: "Quick Finder",
    icon: MapPinned,
    active: true,
    href: "/find-spot",
  },
  { id: "zones", label: "Parking Zones", icon: Navigation, href: "/zone/A" },
  { id: "vehicle", label: "My Vehicle", icon: Car, href: "/zone/B" },
  { id: "history", label: "History", icon: History, href: "/zone/C1" },
];

const sideMenuBottom = [
  { id: "settings", label: "Settings", icon: Settings, href: "/zone/D" },
  { id: "logout", label: "Logout", icon: LogOut, href: "/" },
];

function buildSpot(zone: string, vehicleType: VehicleType): string {
  const prefix = vehicleType === "car" ? `${zone}-C` : `${zone}-M`;
  const suffix = vehicleType === "car" ? "112" : "08";
  return `${prefix}${suffix}`;
}

export default function FindSpotPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("car");
  const [selectedZone, setSelectedZone] = useState<string>("A");
  const [timer, setTimer] = useState<number>(0);
  const [assignedSpot, setAssignedSpot] = useState<string>(
    buildSpot("A", "car"),
  );
  const [statusMessage, setStatusMessage] = useState<string>(
    "เลือกประเภทรถและโซน จากนั้นกด Find Nearest Spot",
  );
  const hasReservation = timer > 0;

  const zoneMap = useMemo<ZoneMapItem[]>(() => {
    return mockParkingZones.map((zone) => {
      const defaultPos = { x: "12%", y: "20%" };
      const pos = zonePositionMap[zone.id] ?? defaultPos;
      const vehicleAvailable = vehicleType === "car" ? zone.car.free : zone.motorcycle.free;

      return {
        id: zone.id,
        available: zone.free,
        vehicleAvailable,
        x: pos.x,
        y: pos.y,
      };
    });
  }, [vehicleType]);

  useEffect(() => {
    if (timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setStatusMessage("หมดเวลาจองแล้ว กรุณาค้นหาช่องจอดใหม่");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const activeZone = useMemo(
    () => zoneMap.find((zone) => zone.id === selectedZone) ?? zoneMap[0],
    [selectedZone, zoneMap],
  );

  const bestZoneForVehicle = useMemo(() => {
    return [...zoneMap].sort((a, b) => b.vehicleAvailable - a.vehicleAvailable)[0];
  }, [zoneMap]);

  const timerLabel = useMemo(() => {
    const minute = Math.floor(timer / 60)
      .toString()
      .padStart(2, "0");
    const second = (timer % 60).toString().padStart(2, "0");
    return `${minute}:${second}`;
  }, [timer]);

  const handleFindSpot = () => {
    const targetZone =
      activeZone.vehicleAvailable > 0
        ? activeZone
        : bestZoneForVehicle.vehicleAvailable > 0
          ? bestZoneForVehicle
          : null;

    if (!targetZone) {
      setStatusMessage("ขณะนี้ไม่มีช่องว่างสำหรับประเภทรถที่เลือก");
      setTimer(0);
      return;
    }

    setSelectedZone(targetZone.id);
    setAssignedSpot(buildSpot(targetZone.id, vehicleType));
    setTimer(15 * 60);

    if (targetZone.id === activeZone.id) {
      setStatusMessage(`จองช่องในโซน ${targetZone.id} สำเร็จแล้ว`);
    } else {
      setStatusMessage(
        `โซน ${activeZone.id} ไม่พอ ระบบแนะนำโซน ${targetZone.id} แทน`,
      );
    }
  };

  const handleReportOccupied = () => {
    setTimer(0);
    setStatusMessage("รับรายงานแล้ว ระบบจะค้นหาช่องจอดใหม่ให้");
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <header className="glass-panel sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 md:px-8">
          <div className="w-20" />
          <h1 className="display-font text-xl font-extrabold text-[#A01D22] md:text-2xl">
            MFU Smart Parking
          </h1>
          <div className="flex items-center gap-2 text-[#59413F]">
            <button
              type="button"
              className="rounded-full bg-white/70 p-2 transition hover:bg-white"
              aria-label="notification"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-full bg-white/70 p-2 transition hover:bg-white"
              aria-label="profile"
            >
              <UserCircle2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-4 px-4 pb-8 pt-6 md:px-8 lg:grid-cols-[260px_1fr]">
        <aside className="section-surface hidden rounded-3xl p-4 lg:flex lg:min-h-[calc(100vh-8.5rem)] lg:flex-col lg:justify-between">
          <nav className="space-y-2">
            {sideMenuTop.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={[
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
                    item.active
                      ? "bg-[#A01D22] text-white"
                      : "text-[#59413F] hover:bg-white",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav className="space-y-2">
            {sideMenuBottom.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#59413F] transition hover:bg-white"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <div className="section-surface rounded-3xl p-6 md:p-8">
              <h2 className="display-font text-3xl font-extrabold text-[#A01D22] md:text-5xl">
                Find My Spot ค้นหาที่จอด
              </h2>
              <p className="mt-3 max-w-3xl text-[#59413F]">
                ระบบ AI วิเคราะห์ occupancy แบบเรียลไทม์จาก sensor + camera
                เพื่อแนะนำช่องจอดที่เหมาะสมที่สุดตามประเภทของยานพาหนะและโซนปลายทาง
              </p>
            </div>

            <div className="section-surface rounded-3xl p-5 md:p-6">
              <p className="label-caps text-xs font-semibold text-[#A01D22]/80">
                Step 1 Vehicle Type
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setVehicleType("car")}
                  className={[
                    "relative rounded-2xl p-5 text-left transition",
                    vehicleType === "car"
                      ? "bg-white ring-2 ring-[#A01D22]"
                      : "bg-white/70 hover:bg-white",
                  ].join(" ")}
                >
                  {vehicleType === "car" && (
                    <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FED488] text-[#785A1A]">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <Car className="h-8 w-8 text-[#A01D22]" />
                  <h3 className="display-font mt-3 text-2xl font-extrabold text-[#191C1D]">
                    Car
                  </h3>
                  <p className="text-sm text-[#59413F]">รถยนต์</p>
                </button>

                <button
                  type="button"
                  onClick={() => setVehicleType("motorcycle")}
                  className={[
                    "relative rounded-2xl p-5 text-left transition",
                    vehicleType === "motorcycle"
                      ? "bg-white ring-2 ring-[#A01D22]"
                      : "bg-white/70 hover:bg-white",
                  ].join(" ")}
                >
                  {vehicleType === "motorcycle" && (
                    <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FED488] text-[#785A1A]">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                  <Bike className="h-8 w-8 text-[#A01D22]" />
                  <h3 className="display-font mt-3 text-2xl font-extrabold text-[#191C1D]">
                    Motorcycle
                  </h3>
                  <p className="text-sm text-[#59413F]">รถจักรยานยนต์</p>
                </button>
              </div>
            </div>

            <div className="section-surface rounded-3xl p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="label-caps text-xs font-semibold text-[#A01D22]/80">
                  Step 2 Zone Roadmap
                </p>
                <p className="text-sm font-semibold text-[#59413F]">
                  Selected Zone: {selectedZone} ({activeZone?.vehicleAvailable ?? 0} spots for
                  {" "}
                  {vehicleType === "car" ? "car" : "motorcycle"})
                </p>
              </div>

              <div className="mt-3 relative min-h-[340px] rounded-2xl bg-white p-4 md:min-h-[420px]">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_20%_20%,rgba(160,29,34,0.1),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(119,90,25,0.12),transparent_45%)]" />
                <div className="absolute left-10 right-10 top-20 h-2 rounded-full bg-[#EDEEF0]" />
                <div className="absolute bottom-20 left-14 right-14 h-2 rounded-full bg-[#EDEEF0]" />
                <div className="absolute bottom-20 top-24 left-20 w-2 rounded-full bg-[#EDEEF0]" />
                <div className="absolute bottom-24 top-16 right-24 w-2 rounded-full bg-[#EDEEF0]" />

                {zoneMap.map((zone) => {
                  const available = zone.vehicleAvailable > 0;
                  const isActive = selectedZone === zone.id;

                  return (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => setSelectedZone(zone.id)}
                      className={[
                        "absolute rounded-xl px-3 py-2 text-left shadow-sm transition",
                        isActive
                          ? "bg-[#A01D22] text-white"
                          : "bg-white text-[#191C1D] hover:-translate-y-0.5",
                      ].join(" ")}
                      style={{ left: zone.x, top: zone.y }}
                    >
                      <p className="label-caps text-[0.62rem] font-semibold">
                        Zone {zone.id}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
                        <span
                          className={[
                            "inline-flex h-2.5 w-2.5 rounded-full",
                            available ? "bg-[#0B5A38]" : "bg-[#A01D22]",
                          ].join(" ")}
                        />
                        {zone.vehicleAvailable} Spots
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm text-[#59413F]">
                {statusMessage}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFindSpot}
              className="primary-cta w-full rounded-xl px-5 py-4 text-base font-bold"
            >
              FIND NEAREST SPOT ค้นหาที่ว่าง
            </button>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="card-surface rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-[#A01D22]" />
                  <div>
                    <p className="display-font text-lg font-extrabold text-[#191C1D]">Tip</p>
                    <p className="mt-1 text-sm text-[#59413F]">
                      โซนที่มี occupancy ต่ำกว่า 60% จะถูกจัดอันดับเป็นโซนแนะนำลำดับแรก
                      เพื่อช่วยลดเวลาวนหาที่จอด
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-surface rounded-2xl p-4">
                <p className="text-sm text-[#59413F]">Estimated Accuracy</p>
                <p className="display-font mt-1 text-3xl font-extrabold text-[#191C1D]">96.4%</p>
                <p className="mt-3 text-sm text-[#59413F]">Live Sensor Data</p>
                <p className="mt-1 inline-flex rounded-full bg-[#D9F3E5] px-3 py-1 text-xs font-semibold text-[#0B5A38]">
                  ACTIVE
                </p>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="card-surface rounded-3xl p-5 md:p-6">
              <p className="label-caps text-xs font-semibold text-[#A01D22]/80">
                The Assignment
              </p>
              <p className="display-font mt-2 text-6xl font-extrabold text-[#A01D22]">
                {assignedSpot}
              </p>
              <p className="mt-1 text-sm text-[#59413F]">
                Zone {activeZone.id} | {vehicleType === "car" ? "Car" : "Motorcycle"}
              </p>

              <div className="mt-4 overflow-hidden rounded-2xl bg-[#F3F4F5] p-3">
                <div className="relative min-h-[140px] rounded-xl bg-white">
                  <div className="absolute left-3 right-3 top-4 h-1 rounded-full bg-[#EDEEF0]" />
                  <div className="absolute left-3 right-3 bottom-4 h-1 rounded-full bg-[#EDEEF0]" />
                  <div className="absolute left-8 top-8 h-12 w-8 rounded bg-[#F3F4F5]" />
                  <div className="absolute left-24 top-8 h-12 w-8 rounded bg-[#F3F4F5]" />
                  <div className="absolute right-16 top-8 h-12 w-8 rounded bg-[#A01D22]/20" />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={handleReportOccupied}
                  className="soft-ghost-border rounded-xl px-4 py-2 text-sm font-semibold text-[#A01D22]"
                >
                  Report Occupied
                </button>
                <Link
                  href={`/zone/${activeZone.id}`}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold",
                    hasReservation
                      ? "secondary-cta"
                      : "pointer-events-none bg-[#F3F4F5] text-[#59413F]",
                  ].join(" ")}
                >
                  Start Navigation
                </Link>
              </div>

              <div className="mt-4 rounded-xl bg-[#F3F4F5] px-4 py-3">
                <p className="text-xs text-[#59413F]">Reservation Countdown</p>
                <p className="display-font mt-1 text-3xl font-extrabold text-[#191C1D]">
                  {hasReservation ? timerLabel : "--:--"}
                </p>
              </div>
            </div>

            <div className="card-surface rounded-2xl p-4 lg:hidden">
              <p className="text-sm text-[#59413F]">Estimated Accuracy 96.4%</p>
              <p className="mt-1 inline-flex rounded-full bg-[#D9F3E5] px-3 py-1 text-xs font-semibold text-[#0B5A38]">
                LIVE SENSOR DATA
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
