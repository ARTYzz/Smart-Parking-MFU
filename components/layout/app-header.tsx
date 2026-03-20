import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h1 className="text-lg font-bold text-slate-900 md:text-xl">
            {APP_NAME}
          </h1>
          <p className="text-sm text-slate-600">{APP_DESCRIPTION}</p>
        </div>
      </div>
    </header>
  );
}
