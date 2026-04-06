import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10 lg:pl-12 lg:pr-8">
      {children}
    </div>
  );
}
