"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { parkingMode, parkingService } from "@/lib/services";
import type { ParkingSubZone } from "@/types/parking";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { BackLink } from "@/components/layout/back-link";
import { SubZoneCard } from "./subzone-card";
import { ZoneSummaryCard } from "./zone-summary-card";

export function ZoneDetail({ zoneId }: { zoneId: string }) {
  const { zones, loading, error: zonesError } = useApp();
  const zone = zones.find(z => z.id.toUpperCase() === zoneId);
  const [result, setResult] = useState<{ zone: typeof zone; slots: ParkingSubZone[]; error: string } | null>(null);
  useEffect(() => {
    let active = true;
    if (zone) parkingService.getDetails(zoneId).then(slots => {
      if (active) setResult({ zone, slots, error: "" });
    }).catch(() => { if (active) setResult({ zone, slots: [], error: "โหลดรายละเอียดไม่สำเร็จ" }); });
    return () => { active = false; };
  }, [zone, zoneId]);
  const current = result?.zone === zone ? result : null;
  return <main><AppHeader /><PageContainer>
    <BackLink href="/parking-zones" label="กลับรายการโซน" />
    <section className="section-surface mt-5 rounded-3xl p-6">
      <h1 className="text-3xl font-bold">โซน {zoneId}</h1>
      <p className="mt-3">{parkingMode === "mock" ? "ช่องจอดและสถานะจำลองจากข้อมูลกลาง" : "ข้อมูลจากระบบที่จอดรถ"}</p>
      <p className="mt-2 text-sm">อัปเดตข้อมูล {zone?.timestamp ? new Date(zone.timestamp).toLocaleString("th-TH") : "—"}</p>
    </section>
    {loading ? <p className="mt-5">กำลังโหลด…</p> : zonesError ? <p role="alert">{zonesError}</p> : !zone ? <p className="mt-5">ไม่พบโซนนี้ <a className="underline" href="/parking-zones">เลือกโซนใหม่</a></p> : <>
      <div className="mt-5"><ZoneSummaryCard summary={zone} zoneId={zone.id} /></div>
      <h2 className="my-5 text-2xl font-bold">ช่องจอด / พื้นที่ย่อย</h2>
      {!zone.hasData ? <p>ยังไม่มีข้อมูลสถานะของโซนนี้</p> : !current ? <p>กำลังโหลดรายละเอียด…</p> : current.error ? <p role="alert">{current.error}</p> : current.slots.length === 0 ? <p>ยังไม่มีรายละเอียดช่องจอด</p> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{current.slots.map(slot => <SubZoneCard key={slot.id} subZone={slot} />)}</div>}
      <section className="card-surface mt-6 rounded-3xl p-6"><h2 className="text-xl font-bold">ภาพจากกล้อง</h2><p className="mt-2">{parkingMode === "mock" ? "โหมดสาธิตไม่มีภาพจากกล้องจริง" : "รอการเชื่อมต่อภาพจากระบบกล้อง"}</p></section>
    </>}
  </PageContainer></main>;
}
