"use client";

import { useState, type FormEvent } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { submitVehicleChange, vehicleTypes, VehicleError, type RegisteredVehicle, type VehicleCategory } from "@/lib/services/vehicles";

export function VehicleChangeForm({ vehicle, refresh, categoryLabel }: {
  vehicle: RegisteredVehicle; refresh: () => Promise<void>; categoryLabel: (category: VehicleCategory) => string;
}) {
  const { language } = useLanguage();
  const text = (th: string, en: string) => language === "en" ? en : th;
  const [kind, setKind] = useState<"edit" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const change = vehicle.change;
  const field = "mt-1 block w-full rounded-xl border border-[#e5dcd5] bg-white px-3 py-2";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!kind || busy) return;
    const fields = new FormData(event.currentTarget);
    setMessage("");
    setBusy(true);
    try {
      await submitVehicleChange(vehicle.userId, vehicle, kind === "delete" ? { kind } : { kind, fields: {
        plate: String(fields.get("plate") ?? ""), province: String(fields.get("province") ?? ""),
        brand: String(fields.get("brand") ?? ""), category: fields.get("category") as VehicleCategory,
      } });
      setKind(null);
      try { await refresh(); } catch {
        setMessage(text("ส่งคำขอแล้ว กรุณากดอัปเดตสถานะ", "Request sent. Refresh the status to see it."));
      }
    } catch (error) {
      const code = error instanceof VehicleError ? error.message : "";
      const messages = {
        fields: text("กรุณาตรวจข้อมูลรถ", "Check the vehicle details."),
        session: text("กรุณาเข้าสู่ระบบใหม่", "Please sign in again."),
        conflict: text("มีคำขอรอตรวจหรือข้อมูลรถเปลี่ยนแล้ว กรุณากดอัปเดตสถานะ", "A request is pending or the vehicle changed. Refresh the status."),
        vehicleMissing: text("ไม่พบรถคันนี้ กรุณากดอัปเดตสถานะ", "This vehicle is unavailable. Refresh the status."),
      };
      setMessage(messages[code as keyof typeof messages] ?? text("ส่งคำขอไม่สำเร็จ กรุณาลองใหม่", "Unable to send the request. Try again."));
    } finally { setBusy(false); }
  }

  return <div className="mt-4 space-y-3 border-t border-[#eee6df] pt-4 text-sm">
    {change && <p role="status">
      {change.kind === "edit" ? text("คำขอแก้ไขรถ", "Edit request") : text("คำขอลบรถ", "Removal request")} · {change.status === "pending"
        ? text("รอตรวจสอบ", "Pending review") : change.status === "approved" ? text("อนุมัติแล้ว", "Approved") : text("ปฏิเสธแล้ว", "Rejected")}
      {change.reason && <span className="mt-1 block text-[#796960]">{change.reason}</span>}
    </p>}
    {change?.status !== "pending" && (kind ? <form onSubmit={submit} className="space-y-3">
      {kind === "edit" ? <div className="grid gap-2 sm:grid-cols-2">
        <label>{text("ทะเบียน", "Plate")}<input className={field} name="plate" required maxLength={32} defaultValue={vehicle.plate} /></label>
        <label>{text("จังหวัด", "Province")}<input className={field} name="province" required maxLength={100} defaultValue={vehicle.province} /></label>
        <label>{text("ยี่ห้อ", "Brand")}<input className={field} name="brand" required maxLength={100} defaultValue={vehicle.brand} /></label>
        <label>{text("ประเภท", "Type")}<select className={field} name="category" defaultValue={vehicle.category}>
          {vehicleTypes.map((type) => <option key={type} value={type}>{categoryLabel(type)}</option>)}
        </select></label>
      </div> : <p>{text("รถจะถูกลบออกจากรายการเมื่อผู้ดูแลอนุมัติ", "The vehicle will be removed after an administrator approves the request.")}</p>}
      <div className="flex flex-wrap gap-4">
        <button className="primary-cta rounded-xl px-3 py-2 font-semibold" disabled={busy} type="submit">{text("ส่งคำขอ", "Send request")}</button>
        <button disabled={busy} type="button" onClick={() => { setKind(null); setMessage(""); }}>{text("ยกเลิก", "Cancel")}</button>
      </div>
    </form> : <div className="flex flex-wrap gap-4">
      <button className="font-semibold text-[#7d000f]" type="button" onClick={() => setKind("edit")}>{text("ขอแก้ไขข้อมูลรถ", "Request an edit")}</button>
      <button className="font-semibold text-[#7d000f]" type="button" onClick={() => setKind("delete")}>{text("ขอลบรถ", "Request removal")}</button>
    </div>)}
    {message && <p role="status" className="text-[#7d000f]">{message}</p>}
  </div>;
}
