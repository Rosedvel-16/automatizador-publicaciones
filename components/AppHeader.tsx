"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AppHeaderProps {
  rightContent?: React.ReactNode;
}

export function AppHeader({ rightContent }: AppHeaderProps) {
  const pathname = usePathname();
  const isCampaignsPage = pathname === "/mis-campanas";

  return (
    <header className="border-b border-neutral-800">
      <div
        className={[
          "mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3",
          isCampaignsPage ? "max-w-6xl" : "max-w-4xl",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-2 h-2 bg-brand-yellow shrink-0" aria-hidden />
          <div>
            <Link href="/" className="block group">
              <h1 className="text-base font-bold tracking-tight text-brand-white whitespace-nowrap group-hover:text-brand-yellow transition-colors">
                Lernymart Ads Engine
              </h1>
            </Link>
            <p className="text-xs text-neutral-500 whitespace-nowrap">
              Generador de campañas Meta Ads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end min-w-0">
          <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className={[
                "text-[10px] sm:text-xs font-semibold px-2 py-1 whitespace-nowrap transition-colors",
                !isCampaignsPage
                  ? "text-brand-yellow border border-brand-yellow/40"
                  : "text-neutral-500 hover:text-brand-white",
              ].join(" ")}
            >
              Nueva campaña
            </Link>
            <Link
              href="/mis-campanas"
              className={[
                "text-[10px] sm:text-xs font-semibold px-2 py-1 whitespace-nowrap transition-colors",
                isCampaignsPage
                  ? "text-brand-yellow border border-brand-yellow/40"
                  : "text-neutral-500 hover:text-brand-white",
              ].join(" ")}
            >
              Mis campañas
            </Link>
          </nav>
          <ThemeToggle />
          {rightContent}
        </div>
      </div>
    </header>
  );
}
