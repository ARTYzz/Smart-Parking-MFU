"use client";
import { useLanguage } from "@/components/providers/language-provider";
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
  const { t, locale } = useLanguage();
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
    <BackLink href="/parking-zones" label={t("กลับรายการโซน")} />
    <section className="section-surface mt-5 rounded-3xl p-6">
      <h1 className="text-3xl font-bold">{t("โซน ")}{t(zoneId)}</h1>
      <p className="mt-3">{t(parkingMode === "mock" ? "ช่องจอดและสถานะจำลองจากข้อมูลกลาง" : "ข้อมูลจากระบบที่จอดรถ")}</p>
      <p className="mt-2 text-sm">{t("อัปเดตข้อมูล ")}{t(zone?.timestamp ? new Date(zone.timestamp).toLocaleString(locale) : "—")}</p>
    </section>
    {t(loading ? <p className="mt-5">{t("กำลังโหลด…")}</p> : zonesError ? <p role="alert">{t(zonesError)}</p> : !zone ? <p className="mt-5">{t("ไม่พบโซนนี้ ")}<a className="underline" href="/parking-zones">{t("เลือกโซนใหม่")}</a></p> : <>
      <div className="mt-5"><ZoneSummaryCard summary={zone} zoneId={zone.id} /></div>
      <h2 className="my-5 text-2xl font-bold">{t("ช่องจอด / พื้นที่ย่อย")}</h2>
      {t(!zone.hasData ? <p>{t("ยังไม่มีข้อมูลสถานะของโซนนี้")}</p> : !current ? <p>{t("กำลังโหลดรายละเอียด…")}</p> : current.error ? <p role="alert">{t(current.error)}</p> : current.slots.length === 0 ? <p>{t("ยังไม่มีรายละเอียดช่องจอด")}</p> :
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{t(current.slots.map(slot => <SubZoneCard key={slot.id} subZone={slot} />))}</div>)}
      <section className="card-surface mt-6 rounded-3xl p-6"><h2 className="text-xl font-bold">{t("ภาพจากกล้อง")}</h2><p className="mt-2">{t(parkingMode === "mock" ? "โหมดสาธิตไม่มีภาพจากกล้องจริง" : "รอการเชื่อมต่อภาพจากระบบกล้อง")}</p></section>
    </>)}
  </PageContainer></main>;
}
