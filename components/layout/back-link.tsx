import Link from "next/link";

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-[#7D000F] transition hover:bg-[#F3F4F5]"
    >
      ← {label}
    </Link>
  );
}
