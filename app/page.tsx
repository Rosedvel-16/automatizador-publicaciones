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
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { ApiErrorState } from "@/components/ApiErrorState";
import { BriefForm } from "@/components/BriefForm";
import { LoadingSteps } from "@/components/LoadingSteps";
import { DraftReview } from "@/components/DraftReview";
import { VariantGallery } from "@/components/VariantGallery";

type ApiErrorContext = "investigation" | "generation" | "regeneration";

interface ApiError {
  message: string;
  context: ApiErrorContext;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

export default function HomePage() {
  const {
    isHydrated,
    hydrateFromStorage,
    saveSession,
    clearSession,
    restoreNotice,
    setRestoreNotice,
  } = useSessionPersistence();

  const [step, setStep] = useState<AppStep>("form");
  const [brief, setBrief] = useState<BriefInput | null>(null);
  const [draft, setDraft] = useState<AIDraft | null>(null);
  const [draftReview, setDraftReview] = useState<DraftReviewInput | null>(null);
  const [variants, setVariants] = useState<AdVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [variantConfirmed, setVariantConfirmed] = useState(false);
  const [metaPublished, setMetaPublished] = useState(false);
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [loadingStepsDone, setLoadingStepsDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  useEffect(() => {
    const { snapshot } = hydrateFromStorage();
    if (!snapshot || snapshot.currentStep === "form") {
      if (snapshot?.briefInput) {
        setBrief(snapshot.briefInput);
      }
      return;
    }

    setBrief(snapshot.briefInput);
    setDraft(snapshot.aiDraft);
    setDraftReview(snapshot.draftReview);
    setVariants(snapshot.adVariants ?? []);
    setSelectedVariantId(snapshot.selectedVariantId);
    setVariantConfirmed(snapshot.variantConfirmed ?? false);
    setMetaPublished(snapshot.metaPublished ?? false);
    setStep(snapshot.currentStep);
    setLoadingStepsDone(true);
    setApiDone(Boolean(snapshot.aiDraft));
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;

    saveSession({
      currentStep: step,
      briefInput: brief,
      aiDraft: draft,
      draftReview,
      adVariants: variants.length > 0 ? variants : null,
      selectedVariantId,
      variantConfirmed,
      metaPublished,
    });
  }, [
    isHydrated,
    step,
    brief,
    draft,
    draftReview,
    variants,
    selectedVariantId,
    variantConfirmed,
    metaPublished,
    saveSession,
  ]);

  useEffect(() => {
    if (step === "loading" && loadingStepsDone && apiDone && draft) {
      setStep("draft");
    }
  }, [step, loadingStepsDone, apiDone, draft]);

  const handleStartNewCampaign = useCallback(() => {
    clearSession();
    setStep("form");
    setBrief(null);
    setDraft(null);
    setDraftReview(null);
    setVariants([]);
    setSelectedVariantId(null);
    setVariantConfirmed(false);
    setMetaPublished(false);
    setApiError(null);
    setLoadingStepsDone(false);
    setApiDone(false);
    setIsGeneratingAds(false);
    setIsRegenerating(false);
    setIsInvestigating(false);
  }, [clearSession]);

  const runInvestigation = useCallback(async (input: BriefInput) => {
    setIsInvestigating(true);
    setApiError(null);
    setDraft(null);
    setLoadingStepsDone(false);
    setApiDone(false);

    try {
      const result = await investigateMarket(input);
      setDraft(result);
      setApiDone(true);
    } catch (error) {
      setApiError({
        message: getErrorMessage(error),
        context: "investigation",
      });
    } finally {
      setIsInvestigating(false);
    }
  }, []);

  const handleBriefSubmit = useCallback(
    async (input: BriefInput) => {
      setBrief(input);
      setDraftReview(null);
      setVariants([]);
      setSelectedVariantId(null);
      setVariantConfirmed(false);
      setMetaPublished(false);
      setStep("loading");
      await runInvestigation(input);
    },
    [runInvestigation]
  );

  const handleInvestigationRetry = useCallback(async () => {
    if (!brief) return;
    setStep("loading");
    await runInvestigation(brief);
  }, [brief, runInvestigation]);

  const handleInvestigationBack = useCallback(() => {
    setApiError(null);
    setStep("form");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setLoadingStepsDone(true);
  }, []);

  const handleDraftReviewChange = useCallback((review: DraftReviewInput) => {
    setDraftReview(review);
  }, []);

  const runGenerateAds = useCallback(
    async (review: DraftReviewInput) => {
      if (!brief) return;

      setIsGeneratingAds(true);
      setApiError(null);

      try {
        const result = await generateAdVariants({ ...brief, ...review });
        setVariants(result);
        setStep("gallery");
      } catch (error) {
        setApiError({
          message: getErrorMessage(error),
          context: "generation",
        });
      } finally {
        setIsGeneratingAds(false);
      }
    },
    [brief]
  );

  const handleDraftSubmit = useCallback(
    async (review: DraftReviewInput) => {
      setDraftReview(review);
      await runGenerateAds(review);
    },
    [runGenerateAds]
  );

  const handleGenerationRetry = useCallback(async () => {
    if (!draftReview) return;
    await runGenerateAds(draftReview);
  }, [draftReview, runGenerateAds]);

  const handleGenerationBack = useCallback(() => {
    setApiError(null);
  }, []);

  const runRegenerateAds = useCallback(async () => {
    if (!brief || !draftReview) return;

    setIsRegenerating(true);
    setApiError(null);

    try {
      const result = await regenerateAdVariants({ ...brief, ...draftReview });
      setVariants(result);
      setSelectedVariantId(null);
      setVariantConfirmed(false);
      setMetaPublished(false);
    } catch (error) {
      setApiError({
        message: getErrorMessage(error),
        context: "regeneration",
      });
    } finally {
      setIsRegenerating(false);
    }
  }, [brief, draftReview]);

  const handleRegenerate = useCallback(async () => {
    await runRegenerateAds();
  }, [runRegenerateAds]);

  const handleRegenerationRetry = useCallback(async () => {
    await runRegenerateAds();
  }, [runRegenerateAds]);

  const handleRegenerationBack = useCallback(() => {
    setApiError(null);
    setStep("draft");
  }, []);

  const handleSelectedVariantChange = useCallback((id: string) => {
    setSelectedVariantId(id);
    setVariantConfirmed(false);
    setMetaPublished(false);
  }, []);

  const showInvestigationError =
    apiError?.context === "investigation" &&
    (step === "loading" || isInvestigating);

  const showGenerationError =
    apiError?.context === "generation" && step === "draft";

  const showRegenerationError =
    apiError?.context === "regeneration" && step === "gallery";

  const showStartNewCampaign = step !== "form";

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <p className="text-sm text-neutral-500">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 bg-brand-yellow shrink-0" aria-hidden />
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-brand-white">
                Lernymart Ads Engine
              </h1>
              <p className="text-xs text-neutral-500">
                Generador de campañas Meta Ads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {showStartNewCampaign && (
              <button
                type="button"
                onClick={handleStartNewCampaign}
                className="hidden sm:inline text-xs text-neutral-500 underline underline-offset-2 transition-colors hover:text-brand-white"
              >
                Empezar nueva campaña
              </button>
            )}
            <StepIndicator current={step} />
          </div>
        </div>
      </header>

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
            <BriefForm
              onSubmit={handleBriefSubmit}
              initialValues={brief ?? undefined}
            />
          </section>
        )}

        {step === "loading" && showInvestigationError && apiError && (
          <ApiErrorState
            message={apiError.message}
            onRetry={handleInvestigationRetry}
            onBack={handleInvestigationBack}
            backLabel="Volver al formulario"
            isRetrying={isInvestigating}
          />
        )}

        {step === "loading" && !showInvestigationError && (
          <LoadingSteps onComplete={handleLoadingComplete} apiDone={apiDone} />
        )}

        {step === "draft" && draft && (
          <>
            {showGenerationError && apiError && (
              <div className="mb-8">
                <ApiErrorState
                  message={apiError.message}
                  onRetry={handleGenerationRetry}
                  onBack={handleGenerationBack}
                  isRetrying={isGeneratingAds}
                />
              </div>
            )}
            <DraftReview
              draft={draft}
              initialReview={draftReview}
              onReviewChange={handleDraftReviewChange}
              onSubmit={handleDraftSubmit}
              isSubmitting={isGeneratingAds}
            />
          </>
        )}

        {step === "gallery" && brief && (
          <>
            {showRegenerationError && apiError && (
              <div className="mb-8">
                <ApiErrorState
                  message={apiError.message}
                  onRetry={handleRegenerationRetry}
                  onBack={handleRegenerationBack}
                  isRetrying={isRegenerating}
                />
              </div>
            )}
            <VariantGallery
              variants={variants}
              format={brief.formato_anuncio}
              campanaId={draftReview?.campana_id ?? draft?.campana_id ?? null}
              selectedVariantId={selectedVariantId}
              variantConfirmed={variantConfirmed}
              metaPublished={metaPublished}
              onSelectedVariantChange={handleSelectedVariantChange}
              onVariantConfirmed={() => setVariantConfirmed(true)}
              onMetaPublished={() => setMetaPublished(true)}
              onRegenerate={handleRegenerate}
              isRegenerating={isRegenerating}
              onStartNewCampaign={handleStartNewCampaign}
            />
          </>
        )}
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
