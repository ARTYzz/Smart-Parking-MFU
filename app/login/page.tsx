import { isAuthConfigured } from "@/lib/auth/server";
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = isAuthConfigured();
  return <main className="flex min-h-screen items-center justify-center px-5 py-12">
    <section className="w-full max-w-md rounded-3xl border border-white bg-white p-7 shadow-xl md:p-10">
      <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7D000F] text-2xl font-extrabold text-white">P</div>
      <p className="label-caps text-xs font-semibold text-[#7D000F]">Mae Fah Luang University</p>
      <h1 className="display-font mt-3 text-3xl font-extrabold">MFU Smart Parking</h1>
      <p className="mt-4 text-[#59413F]">เข้าสู่ระบบด้วยบัญชี Google ของมหาวิทยาลัยก่อนใช้งาน</p>
      <div className="my-6 rounded-xl bg-[#7D000F]/5 p-4 text-sm"><p className="font-semibold">สำหรับบัญชีมหาวิทยาลัยเท่านั้น</p><p className="mt-1 font-bold text-[#7D000F]">@lamduan.mfu.ac.th</p><p className="mt-2 text-[#59413F]">ไม่รองรับ Gmail ส่วนตัวหรือบัญชีจากโดเมนอื่น</p></div>
      {error === "google" && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">เข้าสู่ระบบไม่สำเร็จ กรุณาเลือกบัญชี @lamduan.mfu.ac.th ที่ Google ยืนยันแล้ว และลองอีกครั้ง</p>}
      {configured ? <a href="/api/auth/google" className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold shadow-sm hover:bg-gray-50"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.23c1.89-1.74 2.99-4.31 2.99-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.41l-3.23-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92V7.49H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.51l3.34-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59C7.2 7.72 9.4 5.96 12 5.96Z"/></svg>เข้าสู่ระบบด้วย Google</a> : <><button disabled className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-semibold text-gray-500">เข้าสู่ระบบด้วย Google</button><p role="status" className="mt-4 text-sm text-[#59413F]">ระบบกำลังเตรียมการเชื่อมต่อ Google Login กรุณาติดต่อผู้ดูแลระบบ</p></>}
      <p className="mt-6 text-xs leading-relaxed text-[#59413F]">การยืนยันตัวตนดำเนินการผ่าน Google เว็บนี้ไม่ขอรหัสผ่านอีเมลของคุณ ข้อมูลที่จอดและการจองยังเป็นข้อมูลสาธิต</p>
    </section>
  </main>;
}
