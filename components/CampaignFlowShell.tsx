"use client";

import Link from "next/link";
import { CAMPAIGN_STEPS } from "@/lib/campaignRoutes";
import { AppStep } from "@/lib/types";
import { AppHeader } from "@/components/AppHeader";
import { useCampaignFlow } from "@/hooks/useCampaignFlow";

function StepIndicator({ current }: { current: AppStep }) {
  const currentIndex = CAMPAIGN_STEPS.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Progreso" className="hidden sm:flex items-center gap-1">
      {CAMPAIGN_STEPS.map((s, i) => {
        const isActive = i === currentIndex;
        const isDone = i < currentIndex;

        return (
          <div key={s.key} className="flex items-center gap-1">
            {i > 0 && (
              <span
                className={[
                  "w-4 h-px",
                  isDone ? "bg-brand-yellow" : "bg-neutral-800",
                ].join(" ")}
                aria-hidden
              />
            )}
            {isDone ? (
              <Link
                href={s.href}
                className="text-[10px] uppercase tracking-wider font-semibold px-2 py-1 text-neutral-400 hover:text-brand-white transition-colors"
              >
                {s.label}
              </Link>
            ) : (
              <span
                className={[
                  "text-[10px] uppercase tracking-wider font-semibold px-2 py-1",
                  isActive
                    ? "text-brand-yellow border border-brand-yellow/40"
                    : "text-neutral-600",
                ].join(" ")}
              >
                {s.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function CampaignFlowShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    isHydrated,
    step,
    restoreNotice,
    setRestoreNotice,
    handleStartNewCampaign,
  } = useCampaignFlow();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <p className="text-sm text-neutral-500">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        rightContent={
          <>
            {step !== "form" && (
              <button
                type="button"
                onClick={handleStartNewCampaign}
                className="hidden sm:inline text-xs text-neutral-500 underline underline-offset-2 transition-colors hover:text-brand-white"
              >
                Empezar nueva campaña
              </button>
            )}
            <StepIndicator current={step} />
          </>
        }
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {restoreNotice && (
          <div
            className="mb-8 flex items-start justify-between gap-4 border border-brand-yellow/30 bg-brand-yellow/5 px-4 py-3"
            role="status"
          >
            <p className="text-sm text-neutral-300">{restoreNotice}</p>
            <button
              type="button"
              onClick={() => setRestoreNotice(null)}
              className="shrink-0 text-xs text-neutral-500 transition-colors hover:text-brand-white"
            >
              Cerrar
            </button>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-neutral-800 mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-xs text-neutral-600">
            Lernymart Ads Engine — Conectado a n8n · PoC v1
          </p>
        </div>
      </footer>
    </div>
  );
}
