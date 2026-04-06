import { AppHeader } from "@/components/layout/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { BackLink } from "@/components/layout/back-link";

export default function HistoryPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />

      <PageContainer>
        <div className="mb-6">
            <BackLink href="/" label="กลับหน้าหลัก" />
        </div>
        <section className="section-surface rounded-3xl p-6 md:p-8">
          <p className="label-caps text-xs font-semibold text-[#7D000F]/80">History</p>
          <h1 className="display-font mt-2 text-4xl font-extrabold text-[#191C1D] md:text-5xl">
            ประวัติการใช้งาน
          </h1>
          <p className="mt-3 text-[#59413F]">
            หน้านี้สำหรับแสดงประวัติการจอดรถ การจองช่อง และการรายงานช่องจอดไม่ว่างย้อนหลัง
          </p>
        </section>
      </PageContainer>
    </main>
  );
}
