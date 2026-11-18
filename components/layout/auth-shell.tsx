"use client";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/components/providers/app-provider";
import { DemoControls } from "./demo-controls";
export function AuthShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error, refresh } = useApp();
  useEffect(() => {
    if (!loading && !user && !error && pathname !== "/login") router.replace("/login");
  }, [user, loading, error, pathname, router]);
  if (pathname === "/login") return children;
  if (!user && error) return <main className="p-8"><p role="alert">{error}</p><button className="mt-4 underline" onClick={() => void refresh()}>ลองใหม่</button></main>;
  if (loading || !user) return <main className="flex min-h-screen items-center justify-center"><p role="status">กำลังตรวจสอบบัญชีมหาวิทยาลัย…</p></main>;
  return <><DemoControls />{children}</>;
}
