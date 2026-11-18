"use client";
import { useEffect, useRef, useState } from "react";
import { CarFront, FileCheck2, Clock3, Trash2, Plus, ShieldCheck, Download } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useApp } from "@/components/providers/app-provider";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { vehicleService, vehicleTypes, VehicleError, type RegisteredVehicle, type VehicleCategory } from "@/lib/services/vehicles";

const categories = { sedan: ["รถเก๋งซีดาน", "Sedan"], hatchback: ["แฮทช์แบ็ก", "Hatchback"], suv: ["เอสยูวี / ครอสโอเวอร์", "SUV / Crossover"], pickup: ["กระบะ", "Pickup"], van: ["รถตู้ / MPV", "Van / MPV"], motorcycle: ["มอเตอร์ไซค์", "Motorcycle"], other: ["อื่น ๆ", "Other"] };
export default function MyVehiclePage() {
  const { user } = useApp();
  return <main className="min-h-screen"><AppHeader /><PageContainer>{user && <VehicleManager key={user.id} userId={user.id} />}</PageContainer></main>;
}
function VehicleManager({ userId }: { userId: string }) {
  const { language, locale } = useLanguage();
  const en = language === "en";
  const text = (th: string, english: string) => en ? english : th;
  const [vehicles, setVehicles] = useState<RegisteredVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState("");
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    vehicleService.list(userId).then(rows => { if (active.current) setVehicles(rows); }).catch(() => { if (active.current) setError("storage"); }).finally(() => { if (active.current) setLoading(false); });
    return () => { active.current = false; };
  }, [userId]);
  async function reload() { const rows = await vehicleService.list(userId); if (active.current) setVehicles(rows); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError(""); setSuccess(false);
    try {
      await vehicleService.submit(userId, { plate: String(data.get("plate") ?? ""), province: String(data.get("province") ?? ""), brand: String(data.get("brand") ?? ""), category: data.get("category") as VehicleCategory, evidence: data.get("evidence") as File });
      if (active.current) { form.current?.reset(); setFileName(""); setSuccess(true); }
      await reload();
    } catch (e) { if (active.current) setError(e instanceof VehicleError ? e.message : "storage"); }
    finally { if (active.current) setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError("");
    try { await vehicleService.remove(userId, id); await reload(); setDeleting(null); }
    catch { setError("storage"); } finally { setBusy(false); }
  }
  function download(vehicle: RegisteredVehicle) {
    const url = URL.createObjectURL(vehicle.evidence);
    const link = document.createElement("a"); link.href = url; link.download = vehicle.evidence.name || "vehicle-evidence"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  const errors: Record<string, string> = {
    fields: text("กรุณากรอกข้อมูลรถให้ครบและถูกต้อง", "Complete all vehicle fields."),
    file: text("แนบไฟล์ JPG, PNG หรือ PDF ที่ไม่ว่าง ขนาดไม่เกิน 5 MB", "Attach a non-empty JPG, PNG or PDF up to 5 MB."),
    duplicate: text("มีทะเบียนและจังหวัดนี้ในบัญชีแล้ว", "This plate and province are already registered to your account."),
    session: text("บัญชีเปลี่ยน กรุณาเข้าสู่ระบบอีกครั้ง", "Your session changed. Please sign in again."),
    storage: text("บันทึกหรือโหลดไม่สำเร็จ ตรวจว่ามีพื้นที่และอนุญาตการเก็บข้อมูลในเบราว์เซอร์ แล้วลองใหม่", "Unable to save or load. Check browser storage permissions and available space, then retry."),
  };
  const field = "mt-2 w-full rounded-xl border border-[#e5dcd5] bg-white px-4 py-3 text-sm outline-none focus:border-[#7d000f] focus:ring-2 focus:ring-[#7d000f]/10";
  return <>
    <section className="rounded-3xl border border-[#e7ddd5] bg-[#faf6f0] p-6 md:p-8">
      <p className="text-xs font-bold tracking-widest text-[#7d000f]">MY GARAGE</p>
      <div className="mt-3 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-extrabold">{text("ยานพาหนะของฉัน", "My vehicles")}</h1><p className="mt-3 text-sm leading-6 text-[#796960]">{text("ลงทะเบียนรถและแนบหลักฐาน เพื่อให้ผู้ดูแลตรวจสอบก่อนยืนยัน", "Register your vehicle and attach evidence for administrator review.")}</p></div><CarFront className="hidden h-12 w-12 text-[#7d000f] sm:block" /></div>
      <div className="mt-6 grid gap-3 text-xs sm:grid-cols-3">{[[Plus, text("1. เพิ่มรถและหลักฐาน", "1. Add vehicle & evidence")], [Clock3, text("2. รอผู้ดูแลตรวจสอบ", "2. Await admin review")], [ShieldCheck, text("3. รับผลการยืนยัน", "3. Receive a decision")]].map(([Icon, label], i) => { const Symbol = Icon as typeof Plus; return <div key={i} className="flex items-center gap-2 rounded-xl bg-white/80 p-3 text-[#7d000f]"><Symbol size={16} />{label as string}</div>; })}</div>
    </section>
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.1fr]">
      <form ref={form} onSubmit={submit} className="rounded-3xl border border-[#e8dfdb] bg-white p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Plus size={20} />{text("เพิ่มยานพาหนะ", "Add a vehicle")}</h2>
        <fieldset disabled={busy || loading} className="mt-5 space-y-4 disabled:opacity-60">
          <label className="block text-sm font-medium">{text("ทะเบียนรถ", "License plate")} *<input name="plate" required maxLength={20} placeholder={text("เช่น 1กข 1234", "e.g. 1AB 1234")} className={field} /></label>
          <label className="block text-sm font-medium">{text("จังหวัดที่จดทะเบียน", "Registration province")} *<input name="province" required maxLength={60} placeholder={text("เช่น เชียงราย", "e.g. Chiang Rai")} className={field} /></label>
          <label className="block text-sm font-medium">{text("ยี่ห้อรถ", "Brand")} *<input name="brand" required maxLength={60} placeholder="Toyota, Honda, Yamaha…" className={field} /></label>
          <label className="block text-sm font-medium">{text("ประเภทรถ", "Vehicle type")} *<select name="category" className={field} defaultValue="sedan">{vehicleTypes.map(type => <option key={type} value={type}>{categories[type][en ? 1 : 0]}</option>)}</select></label>
          <div className="rounded-2xl border border-dashed border-[#d9bfb4] bg-[#fcf8f3] p-4">
            <label htmlFor="vehicle-evidence" className="flex items-center gap-2 text-sm font-semibold"><FileCheck2 size={18} className="text-[#7d000f]" />{text("หลักฐานการเป็นเจ้าของรถ", "Proof of ownership")} *</label>
            <p id="evidence-help" className="mt-2 text-xs leading-6 text-[#806e64]">{text("เช่น สำเนาทะเบียนรถ • JPG / PNG / PDF ไม่เกิน 5 MB", "e.g. vehicle registration • JPG / PNG / PDF up to 5 MB")}</p>
            <input id="vehicle-evidence" name="evidence" type="file" accept=".jpg,.jpeg,.png,.pdf" required aria-describedby="evidence-help" onChange={e => setFileName(e.target.files?.[0]?.name ?? "")} className="mt-3 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-[#7d000f] file:px-3 file:py-2 file:text-white" />
            {fileName && <p className="mt-2 break-all text-xs text-[#796960]">{fileName}</p>}
          </div>
          <label className="flex items-start gap-2 text-xs leading-6 text-[#796960]"><input type="checkbox" required className="mt-1 accent-[#7d000f]" />{text("ฉันยืนยันว่ามีสิทธิ์ใช้รถและเอกสารที่แนบ และเข้าใจว่าการลงทะเบียนยังต้องผ่านการตรวจสอบ", "I confirm I am authorized to use this vehicle and document, and understand registration requires review.")}</label>
          <button className="primary-cta w-full rounded-xl px-4 py-3 text-sm font-bold" type="submit">{busy ? text("กำลังบันทึก…", "Saving…") : text("ส่งคำขอตรวจสอบสาธิต", "Submit demo review request")}</button>
        </fieldset>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-900">{text("โหมดสาธิต: ใช้เอกสารตัวอย่างแทนเอกสารจริง ไฟล์เก็บเฉพาะเบราว์เซอร์นี้ ยังไม่ส่งถึงแอดมิน การล้างข้อมูลเบราว์เซอร์จะลบรถและไฟล์ที่แนบ", "Demo: use sample documents. Files stay in this browser and are not sent to an admin. Clearing browser data removes vehicles and attachments.")}</p>
        {error && <div role="alert" className="mt-4 text-sm text-red-800">{errors[error] ?? errors.storage}<button type="button" disabled={busy} onClick={() => { setBusy(true); reload().then(() => setError("")).catch(() => setError("storage")).finally(() => setBusy(false)); }} className="ml-2 underline">{text("ลองใหม่", "Retry")}</button></div>}
        {success && <p role="status" className="mt-4 text-sm text-green-800">{text("บันทึกคำขอสาธิตแล้ว สถานะรอตรวจสอบ", "Demo request saved. Awaiting review.")}</p>}
      </form>
      <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">{text("รถที่ลงทะเบียน", "Registered vehicles")}</h2><span className="rounded-full bg-[#eee5dd] px-3 py-1 text-xs">{vehicles.length}</span></div>
        {loading ? <p role="status">{text("กำลังโหลด…", "Loading…")}</p> : vehicles.length === 0 ? <div className="rounded-3xl border border-dashed border-[#ddcfc4] p-10 text-center"><CarFront className="mx-auto mb-4 text-[#b59d8c]" size={40} /><p className="font-semibold">{text("ยังไม่มีรถที่ลงทะเบียน", "No vehicles registered")}</p><p className="mt-2 text-sm text-[#938176]">{text("เพิ่มรถคันแรกด้วยแบบฟอร์มด้านข้าง", "Add your first vehicle using the form.")}</p></div> : <div className="space-y-4">{vehicles.map(vehicle => <article key={vehicle.id} className="rounded-3xl border border-[#e8dfdb] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-[#9c897d]">{categories[vehicle.category][en ? 1 : 0]}</p><h3 className="mt-1 text-xl font-extrabold text-[#7d000f]">{vehicle.brand}</h3></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${vehicle.status === "approved" ? "bg-green-50 text-green-800" : vehicle.status === "rejected" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>{vehicle.status === "approved" ? text("ยืนยันแล้ว", "Approved") : vehicle.status === "rejected" ? text("ต้องแก้ไข", "Changes required") : text("รอตรวจสอบ", "Pending review")}</span></div>
          <div className="my-4 rounded-xl border-2 border-[#e1d9ce] bg-[#faf8f4] px-5 py-3 text-center"><p className="text-2xl font-bold tracking-wider">{vehicle.plate}</p><p className="mt-1 text-xs text-[#857367]">{vehicle.province}</p></div>
          <p className="text-xs text-[#8a786c]">{text("ส่งคำขอ", "Submitted")} · {new Date(vehicle.submittedAt).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" })}</p>
          {vehicle.reviewNote && <p className="mt-3 text-sm">{vehicle.reviewNote}</p>}
          <p className="mt-3 text-xs leading-6 text-[#8a786c]">{text("ระบบแอดมินยังไม่เปิดใช้งาน คำขอสาธิตจะคงสถานะรอตรวจสอบ", "Admin review is not available yet. Demo requests remain pending.")}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6df] pt-4"><button onClick={() => download(vehicle)} className="flex items-center gap-1.5 text-xs font-semibold text-[#7d000f]"><Download size={14} />{text("ดาวน์โหลดหลักฐาน", "Download evidence")}</button><button disabled={busy} onClick={() => setDeleting(vehicle.id)} className="flex items-center gap-1.5 text-xs text-[#8c7066]"><Trash2 size={14} />{text("ลบคำขอ", "Delete request")}</button></div>
          {deleting === vehicle.id && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm"><p>{text("ลบรถและไฟล์หลักฐานนี้?", "Delete this vehicle and its evidence?")}</p><div className="mt-3 flex gap-4"><button disabled={busy} onClick={() => void remove(vehicle.id)} className="font-semibold text-red-800">{text("ยืนยันลบ", "Confirm deletion")}</button><button disabled={busy} onClick={() => setDeleting(null)}>{text("ยกเลิก", "Cancel")}</button></div></div>}
        </article>)}</div>}
      </section>
    </div>
  </>;
}
