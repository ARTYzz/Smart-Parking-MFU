"use client";
import { useLanguage } from "@/components/providers/language-provider";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { DemoControls } from "./demo-controls";
export function AuthShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error, refresh } = useApp();
  useEffect(() => {
    if (!loading && !user && !error && pathname !== "/login") router.replace("/login");
  }, [user, loading, error, pathname, router]);
  if (pathname === "/login") return children;
  if (!user && error) return <main className="p-8"><p role="alert">{t(error)}</p><button className="mt-4 underline" onClick={() => void refresh()}>{t("ลองใหม่")}</button></main>;
  if (loading || !user) return <main className="flex min-h-screen items-center justify-center"><p role="status">{t("กำลังตรวจสอบบัญชีมหาวิทยาลัย…")}</p></main>;
  return <><DemoControls />{t(children)}</>;
}
