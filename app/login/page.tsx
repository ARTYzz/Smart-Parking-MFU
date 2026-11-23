import { cookies } from "next/headers";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { createTranslator } from "@/lib/i18n/messages";
import { ShieldCheck, ArrowUpRight } from "lucide-react";
import { zoneCatalog } from "@/lib/services/catalog";
import { parkingMode } from "@/lib/services";
import { isAuthConfigured } from "@/lib/auth/server";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = createTranslator((await cookies()).get("mfu-language")?.value === "en" ? "en" : "th");
  const { error } = await searchParams;
  const configured = isAuthConfigured();
  const en = (await cookies()).get("mfu-language")?.value === "en";
  const copy = (th: string, english: string) => en ? english : th;
  const capacity = zoneCatalog.reduce((total, zone) => total + zone.car + zone.motorcycle, 0);
  return <main className="login-layout">
    <section className="login-hero">
      <div className="login-brand"><b>P</b><span>MFU Parking<small>SMART PARKING</small></span></div>
      <div className="login-story">
        <h2>{copy("ที่จอดที่ใช่", "Find the right spot")}<br/>{copy("สำหรับทุกวัน", "for every day")}<br/><em>{copy("ในมหาวิทยาลัย", "on campus")}</em></h2>
        <p>{copy("ค้นหาพื้นที่จอด เช็กความพร้อม และจัดการการจองในที่เดียว", "Find parking, check availability, and manage your bookings.")}</p>
        {parkingMode === "mock" && <div className="login-metrics">
          <h3>{copy("ภาพรวมพื้นที่จอด (ข้อมูลจำลอง)", "Campus parking (demo data)")}</h3>
          <div>{[[capacity, copy("ช่องทั้งหมด", "Total spaces")], [zoneCatalog.length, copy("โซน", "Zones")]].map(([value,label]) => <article key={label}><strong>{value}</strong><span>{label}</span></article>)}</div>
        </div>}
      </div>
      <footer>Mae Fah Luang University</footer>
    </section>
    <div className="login-access"><div className="login-language"><LanguageSwitcher /></div>
    <section className="mx-auto w-full max-w-md">
      <span className="rounded-full bg-[#f8e9eb] px-3 py-2 text-[11px] font-bold text-[#7d000f]">CAMPUS ACCESS ONLY</span>
      <h1 className="display-font mt-3 text-3xl font-extrabold">{t("ยินดีต้อนรับ")}</h1>
      <p className="mt-3 text-sm leading-7 text-[#75665f]">{t("ที่จอดพร้อม วันของคุณก็พร้อม")}<br />{t("เข้าสู่ระบบเพื่อเริ่มวางแผนการเดินทาง")}</p>
      {t(error === "google" && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{t("เข้าสู่ระบบไม่สำเร็จ กรุณาเลือกบัญชี @lamduan.mfu.ac.th ที่ Google ยืนยันแล้ว และลองอีกครั้ง")}</p>)}
      {t(error === "configuration" && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{t("เชื่อมต่อระบบเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ")}</p>)}
      {t(configured ? <a href="/api/auth/google" className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-[#d9d5cf] bg-white px-4 py-4 text-sm font-semibold shadow-sm transition hover:border-[#7d000f] hover:bg-[#faf6f3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7d000f]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.31 2.99-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.49H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.51l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>{t("เข้าสู่ระบบด้วย Google")}<ArrowUpRight size={16} className="ml-auto text-[#8a7b72]" /></a> : <><button disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-semibold text-gray-500">{t("เข้าสู่ระบบด้วย Google")}</button><p role="status" className="mt-4 text-sm text-[#59413F]">{t("ระบบกำลังเตรียมการเชื่อมต่อ Google Login กรุณาติดต่อผู้ดูแลระบบ")}</p></>)}
      <div className="data-notice mt-8"><p className="font-semibold">{t("สำหรับบัญชีมหาวิทยาลัยเท่านั้น")}</p><p className="mt-1 font-bold text-[#7D000F]">{t("@lamduan.mfu.ac.th")}</p><p className="mt-2 text-[#59413F]">{t("ไม่รองรับ Gmail ส่วนตัวหรือบัญชีจากโดเมนอื่น")}</p></div>
      <p className="mt-6 border-t border-slate-200 pt-5 flex items-start gap-2 text-[11px] leading-relaxed text-[#8b8179]"><ShieldCheck size={16} className="shrink-0 text-[#647d60]" />{t("การยืนยันตัวตนดำเนินการผ่าน Google เว็บนี้ไม่ขอรหัสผ่านอีเมลของคุณ ข้อมูลที่จอดและการจองยังเป็นข้อมูลสาธิต")}</p>
    </section></div>
  </main>;
}
