import { cookies } from "next/headers";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { createTranslator } from "@/lib/i18n/messages";
import { MapPin, ShieldCheck, ArrowUpRight, CarFront, CalendarCheck, Leaf } from "lucide-react";
import { isAuthConfigured } from "@/lib/auth/server";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const t = createTranslator((await cookies()).get("mfu-language")?.value === "en" ? "en" : "th");
  const { error } = await searchParams;
  const configured = isAuthConfigured();
  return <main className="min-h-screen bg-[#f5f2eb] p-4 sm:p-8 lg:p-10">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 pb-6">
      <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7d000f] text-xl font-black text-white">{t("P")}</span><div><p className="text-sm font-extrabold tracking-tight">{t("MFU ")}<span className="font-normal">{t("Smart Parking")}</span></p><p className="text-[9px] tracking-[.18em] text-stone-500">{t("MAE FAH LUANG UNIVERSITY")}</p></div></div>
      <div className="flex items-center gap-2"><span className="hidden rounded-full border border-[#d8dfcf] bg-[#eaf0e2] px-3 py-1.5 text-[10px] font-semibold text-[#5b7050] sm:block">{t("CAMPUS DEMO")}</span><LanguageSwitcher /></div>
    </div>
    <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_24px_80px_-30px_#49332530] lg:min-h-[680px] lg:grid-cols-[1.15fr_1fr]">
      <section className="relative overflow-hidden bg-[#203c33] px-7 pt-9 text-white sm:px-10 lg:px-12 lg:pt-12">
        <div className="relative z-10"><p className="flex items-center gap-2 text-[10px] font-semibold tracking-[.22em] text-[#c8d9ba]"><span className="h-1.5 w-1.5 rounded-full bg-[#d9be7a]" />{t(" A BETTER WAY TO CAMPUS")}</p>
        <h2 className="mt-5 text-3xl font-semibold leading-[1.45] sm:text-4xl">{t("เริ่มวันดี ๆ")}<br />{t("ด้วยที่จอดที่ใช่")}</h2><p className="mt-4 max-w-xs text-sm leading-7 text-[#c2d0c5]">{t("วางแผนก่อนออกเดินทาง เลือกโซนที่สะดวก")}<br />{t("แล้วใช้เวลาในมหาวิทยาลัยได้มากขึ้น")}</p></div>
        <svg viewBox="0 0 560 340" aria-hidden="true" className="mx-auto mt-5 w-full max-w-lg" fill="none">
          <defs><pattern id="login-map-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#8ea58e" opacity=".25" /></pattern></defs>
          <rect width="560" height="340" fill="url(#login-map-grid)" />
          <path d="M5 279 C90 255 88 184 160 203 S230 295 307 254 S363 160 441 169 S507 138 552 65" stroke="#3c5748" strokeWidth="39" />
          <path d="M5 279 C90 255 88 184 160 203 S230 295 307 254 S363 160 441 169 S507 138 552 65" stroke="#d4b575" strokeWidth="19" />
          <path d="M5 279 C90 255 88 184 160 203 S230 295 307 254 S363 160 441 169 S507 138 552 65" stroke="#f3dfaf" strokeDasharray="8 10" strokeWidth="2" />
          <path d="M107 62 L187 97 L258 69 L351 115 L415 68 M279 95 V226 M178 115 V177" stroke="#768572" strokeWidth="9" strokeLinecap="round" />
          <path d="M380 211 Q429 194 459 226 Q477 259 425 288 Q367 305 380 269Z" fill="#5b9292" />
          <g fill="#dbb4a2" stroke="#f1d6bd" strokeWidth="2"><rect x="108" y="90" width="61" height="55" rx="5"/><rect x="216" y="116" width="53" height="43" rx="5"/><rect x="295" y="173" width="55" height="46" rx="5"/><rect x="335" y="56" width="70" height="42" rx="5"/><rect x="191" y="274" width="91" height="36" rx="5"/></g>
          <g fill="#81976a">{t([[65,160],[88,149],[97,177],[325,136],[347,143],[372,130],[470,87],[490,103],[139,298]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="10" />))}</g>
          <circle cx="281" cy="72" r="30" fill="#425d46" stroke="#94a17e" strokeWidth="6"/><circle cx="281" cy="72" r="13" fill="#d4b575" />
          <g transform="translate(92 52)"><rect width="92" height="35" rx="10" fill="#fffaf0"/><circle cx="17" cy="17" r="5" fill="#368660"/><text x="30" y="22" fill="#294838" fontSize="13" fontFamily="Arial" fontWeight="700">{t("D1")}</text><text x="61" y="22" fill="#6b7c6b" fontSize="11" fontFamily="Arial">{t("P")}</text></g>
          <g transform="translate(293 126)"><path d="M22 0 C-7 0 -7 31 22 54 C51 31 51 0 22 0Z" fill="#aa3345" stroke="#f8ede0" strokeWidth="3"/><circle cx="22" cy="19" r="8" fill="#fff7e8"/></g>
          <text x="233" y="143" fill="#644b40" fontSize="12" fontFamily="Arial" fontWeight="700">{t("E1")}</text>
          <text x="356" y="82" fill="#644b40" fontSize="12" fontFamily="Arial" fontWeight="700">{t("C3")}</text>
        </svg>
        <div className="mb-7 flex items-center justify-between gap-3 border-t border-white/15 pt-4 text-[10px] text-[#bbcebe]"><span className="flex items-center gap-2"><Leaf size={14} />{t(" SMART PARKING · GREEN CAMPUS")}</span><span>{t("ภาพประกอบแผนผัง")}</span></div>
      </section>
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
    <section className="mx-auto w-full max-w-md">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfd2] bg-[#f9f5ee] text-[#7d000f]"><MapPin size={23} /></div>
      <p className="label-caps text-xs font-semibold text-[#7D000F]">{t("WELCOME TO YOUR CAMPUS")}</p>
      <h1 className="display-font mt-3 text-3xl font-extrabold">{t("ยินดีต้อนรับ")}</h1>
      <p className="mt-3 text-sm leading-7 text-[#75665f]">{t("ที่จอดพร้อม วันของคุณก็พร้อม")}<br />{t("เข้าสู่ระบบเพื่อเริ่มวางแผนการเดินทาง")}</p>
      <div className="my-6 rounded-xl bg-[#7D000F]/5 p-4 text-sm"><p className="font-semibold">{t("สำหรับบัญชีมหาวิทยาลัยเท่านั้น")}</p><p className="mt-1 font-bold text-[#7D000F]">{t("@lamduan.mfu.ac.th")}</p><p className="mt-2 text-[#59413F]">{t("ไม่รองรับ Gmail ส่วนตัวหรือบัญชีจากโดเมนอื่น")}</p></div>
      {t(error === "google" && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{t("เข้าสู่ระบบไม่สำเร็จ กรุณาเลือกบัญชี @lamduan.mfu.ac.th ที่ Google ยืนยันแล้ว และลองอีกครั้ง")}</p>)}
      {t(error === "configuration" && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{t("เชื่อมต่อระบบเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ")}</p>)}
      {t(configured ? <a href="/api/auth/google" className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#d9d5cf] bg-white px-4 py-4 text-sm font-semibold shadow-sm transition hover:border-[#7d000f] hover:bg-[#faf6f3] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7d000f]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.31 2.99-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.49H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.51l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>{t("เข้าสู่ระบบด้วย Google")}<ArrowUpRight size={16} className="ml-auto text-[#8a7b72]" /></a> : <><button disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-semibold text-gray-500">{t("เข้าสู่ระบบด้วย Google")}</button><p role="status" className="mt-4 text-sm text-[#59413F]">{t("ระบบกำลังเตรียมการเชื่อมต่อ Google Login กรุณาติดต่อผู้ดูแลระบบ")}</p></>)}
      <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-[#8b8179]"><ShieldCheck size={16} className="shrink-0 text-[#647d60]" />{t("การยืนยันตัวตนดำเนินการผ่าน Google เว็บนี้ไม่ขอรหัสผ่านอีเมลของคุณ ข้อมูลที่จอดและการจองยังเป็นข้อมูลสาธิต")}</p>
      <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#ece7df] pt-6"><div className="flex items-center gap-2 text-xs text-[#6b645d]"><CarFront size={17} className="text-[#8b3340]" />{t(" สำรวจโซนจอด")}</div><div className="flex items-center gap-2 text-xs text-[#6b645d]"><CalendarCheck size={17} className="text-[#8b3340]" />{t(" วางแผนการจอง")}</div></div>
    </section></div></div>
    <footer className="mx-auto mt-6 flex max-w-7xl flex-wrap justify-between gap-2 text-[10px] tracking-wide text-[#93897e]"><span>{t("MFU SMART PARKING · มหาวิทยาลัยแม่ฟ้าหลวง")}</span><span>{t("พื้นที่ดี ๆ เริ่มจากการวางแผน")}</span></footer>
  </main>;
}
