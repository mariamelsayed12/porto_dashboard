import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="flex-1 w-full bg-background overflow-y-auto h-[calc(100vh-72px)] scroll-smooth">
      <div className="max-w-[1440px] mx-auto py-8 md:py-12 px-4 md:px-8 flex flex-col gap-8 md:gap-10">
        {children}
      </div>
    </main>
  );
}
