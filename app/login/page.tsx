"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { useApp } from "@/components/providers/app-provider";
import { authMode } from "@/lib/services";
import { demoAccounts } from "@/lib/services/mock";

export default function LoginPage() {
  const { signIn, user } = useApp();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function select(id: string) {
    setBusy(true);
    try { await signIn(id); router.push("/"); }
    catch (error) { setError(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  return <main><AppHeader /><PageContainer>
    <section className="section-surface rounded-3xl p-6 md:p-8">
      <p className="label-caps text-sm text-[#7D000F]">Demo accounts</p>
      <h1 className="mt-2 text-3xl font-bold">เลือกบัญชีสาธิต</h1>
      <p className="mt-3">บัญชีสมมติสำหรับทดลองบทบาท ไม่ต้องใช้รหัสผ่านหรือบัญชีมหาวิทยาลัย</p>
      <p className="mt-2 text-sm">แต่ละบทบาทมีโควตาและระยะเวลาจองตามนโยบายสาธิต การจองและประวัติแยกตามบัญชี</p>
      {authMode === "reg" ? <p role="status" className="mt-6">ระบบ REG ยังไม่ได้เชื่อมต่อ กรุณารอการเปิดใช้งานจากมหาวิทยาลัย</p> :
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{demoAccounts.map(account =>
          <button key={account.id} disabled={busy} onClick={() => void select(account.id)} className="card-surface rounded-2xl p-6 text-left hover:ring-2 hover:ring-[#7D000F] disabled:opacity-50">
            <strong className="block text-xl">{account.name}</strong>
            <span>{account.role}{user?.id === account.id ? " • บัญชีปัจจุบัน" : ""}</span>
          </button>)}</div>}
      {error && <p role="alert">{error}</p>}
    </section>
  </PageContainer></main>;
}
