"use client";
import { useLanguage } from "@/components/providers/language-provider";
import Link from "next/link";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  const { t } = useLanguage();
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-[#7D000F] transition hover:bg-[#F3F4F5]"
    >{t("←")}{t(label)}
    </Link>
  );
}
