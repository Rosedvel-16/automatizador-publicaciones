"use client";

import { useCallback, useEffect, useState } from "react";
import {
  investigateMarket,
  generateAdVariants,
  regenerateAdVariants,
} from "@/lib/api";
import {
  AdVariant,
  AIDraft,
  AppStep,
  BriefInput,
  DraftReviewInput,
} from "@/lib/types";
import { BriefForm } from "@/components/BriefForm";
import { LoadingSteps } from "@/components/LoadingSteps";
import { DraftReview } from "@/components/DraftReview";
import { VariantGallery } from "@/components/VariantGallery";

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("form");
  const [brief, setBrief] = useState<BriefInput | null>(null);
  const [draft, setDraft] = useState<AIDraft | null>(null);
  const [draftReview, setDraftReview] = useState<DraftReviewInput | null>(null);
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadingStepsDone, setLoadingStepsDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);

  useEffect(() => {
    if (step === "loading" && loadingStepsDone && apiDone && draft) {
      setStep("draft");
    }
  }, [step, loadingStepsDone, apiDone, draft]);

  const handleBriefSubmit = useCallback(async (input: BriefInput) => {
    setBrief(input);
    setDraft(null);
    setLoadingStepsDone(false);
    setApiDone(false);
    setStep("loading");

    try {
      const result = await investigateMarket(input);
      setDraft(result);
      setApiDone(true);
    } catch {
      setStep("form");
    }
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoadingStepsDone(true);
  }, []);

  const handleDraftSubmit = useCallback(
    async (review: DraftReviewInput) => {
      if (!brief) return;

      setDraftReview(review);
      setIsGeneratingAds(true);

      try {
        const result = await generateAdVariants({ ...brief, ...review });
        setVariants(result);
        setStep("gallery");
      } finally {
        setIsGeneratingAds(false);
      }
    },
    [brief]
  );

  const handleRegenerate = useCallback(async () => {
    if (!brief || !draftReview) return;

    setIsRegenerating(true);
    try {
      const result = await regenerateAdVariants({ ...brief, ...draftReview });
      setVariants(result);
    } finally {
      setIsRegenerating(false);
    }
  }, [brief, draftReview]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-brand-yellow" aria-hidden />
            <div>
              <h1 className="text-base font-bold tracking-tight text-brand-white">
                Lernymart Ads Engine
              </h1>
              <p className="text-xs text-neutral-500">
                Generador de campañas Meta Ads
              </p>
            </div>
          </div>

          <StepIndicator current={step} />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {step === "form" && (
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-brand-white mb-2">
                Brief del producto
              </h2>
              <p className="text-sm text-neutral-500 max-w-lg">
                Completa los datos mínimos. La IA investigará tu mercado y
                generará un borrador de estrategia publicitaria.
              </p>
            </div>
            <BriefForm onSubmit={handleBriefSubmit} initialValues={brief ?? undefined} />
          </section>
        )}

        {step === "loading" && (
          <LoadingSteps onComplete={handleLoadingComplete} />
        )}

        {step === "draft" && draft && (
          <DraftReview
            draft={draft}
            onSubmit={handleDraftSubmit}
            isSubmitting={isGeneratingAds}
          />
        )}

        {step === "gallery" && brief && (
          <VariantGallery
            variants={variants}
            format={brief.formato_anuncio}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        )}
      </main>

      <footer className="border-t border-neutral-800 mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-xs text-neutral-600">
            Lernymart Ads Engine — Simulación de flujo. Backend IA pendiente de
            integración.
          </p>
        </div>
      </footer>
    </div>
  );
}

const STEPS: { key: AppStep; label: string }[] = [
  { key: "form", label: "Brief" },
  { key: "loading", label: "Investigación" },
  { key: "draft", label: "Borrador" },
  { key: "gallery", label: "Anuncios" },
];

function StepIndicator({ current }: { current: AppStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <nav aria-label="Progreso" className="hidden sm:flex items-center gap-1">
      {STEPS.map((s, i) => {
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
            <span
              className={[
                "text-[10px] uppercase tracking-wider font-semibold px-2 py-1",
                isActive
                  ? "text-brand-yellow border border-brand-yellow/40"
                  : isDone
                    ? "text-neutral-400"
                    : "text-neutral-600",
              ].join(" ")}
            >
              {s.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
