import Link from "next/link";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export function AppHeader() {
  return (
    <header className="glass-panel sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-end md:justify-between md:px-8">
        <div className="pl-1 md:pl-3">
          <p className="label-caps text-[0.7rem] font-semibold text-[#7D000F]/80">
            Mae Fah Luang University
          </p>
          <h1 className="display-font mt-1 text-xl font-extrabold text-[#191C1D] md:text-2xl">
            {APP_NAME}
          </h1>
          <p className="mt-1 text-sm text-[#59413F]">{APP_DESCRIPTION}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold md:justify-end">
          <Link
            href="/"
            className="rounded-full bg-white/70 px-4 py-2 text-[#7D000F] transition hover:bg-white"
          >
            Dashboard
          </Link>
          <Link
            href="/find-spot"
            className="rounded-full bg-white/70 px-4 py-2 text-[#7D000F] transition hover:bg-white"
          >
            Quick Finder
          </Link>
          <Link
            href="/zone/A"
            className="rounded-full bg-white/55 px-4 py-2 text-[#7D000F] transition hover:bg-white"
          >
            Parking Zones
          </Link>
        </nav>
      </div>
    </header>
  );
}
