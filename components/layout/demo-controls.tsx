"use client";
import { useState } from "react";
import { useApp } from "@/components/providers/app-provider";
import { parkingMode } from "@/lib/services";
import { resetDemo, setDemoScenario } from "@/lib/services/mock";

export function DemoControls() {
  const { refresh, error, loading } = useApp();
  const [message, setMessage] = useState("");
  async function act(action: () => void | Promise<void>) {
    try { await action(); await refresh(); setMessage(""); }
    catch (error) { setMessage(error instanceof Error ? error.message : "ดำเนินการไม่สำเร็จ"); }
  }
  return <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
      <strong>{parkingMode === "mock" ? "ข้อมูลที่จอดสาธิต • ไม่ใช่สถานะจริง" : "ข้อมูลที่จอดจาก API"}</strong>
      {parkingMode === "mock" && <>
        <button className="rounded border px-3 py-1" onClick={() => void act(() => setDemoScenario("full"))}>จำลองทุกโซนเต็ม</button>
        <button className="rounded border px-3 py-1" onClick={() => void act(() => setDemoScenario("no-data"))}>จำลองไม่มีข้อมูล</button>
        <button className="rounded border px-3 py-1" onClick={() => void act(() => setDemoScenario("normal"))}>สถานะปกติ</button>
        <button className="underline" onClick={() => void act(resetDemo)}>รีเซ็ตเดโม (ล้างบัญชี การจอง ประวัติ และแจ้งเตือน)</button>
      </>}
      {loading && <span role="status">กำลังโหลด…</span>}
      {(error || message) && <p role="alert">{error || message} <button className="underline" onClick={() => void refresh()}>ลองใหม่</button></p>}
    </div>
  </div>;
}
