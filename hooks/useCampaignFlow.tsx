"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  generateAdVariants,
  investigateMarket,
  regenerateAdVariants,
} from "@/lib/api";
import { pathForStep, stepFromPathname } from "@/lib/campaignRoutes";
import {
  AdVariant,
  AIDraft,
  AppStep,
  BriefInput,
  DraftReviewInput,
} from "@/lib/types";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";

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

interface CampaignFlowContextValue {
  isHydrated: boolean;
  step: AppStep;
  brief: BriefInput | null;
  draft: AIDraft | null;
  draftReview: DraftReviewInput | null;
  variants: AdVariant[];
  selectedVariantIds: string[];
  variantConfirmed: boolean;
  metaPublished: boolean;
  isGeneratingAds: boolean;
  isRegenerating: boolean;
  isInvestigating: boolean;
  apiDone: boolean;
  apiError: ApiError | null;
  restoreNotice: string | null;
  setRestoreNotice: (notice: string | null) => void;
  showInvestigationError: boolean;
  showGenerationError: boolean;
  showRegenerationError: boolean;
  handleStartNewCampaign: () => void;
  handleBriefSubmit: (input: BriefInput) => Promise<void>;
  handleInvestigationRetry: () => Promise<void>;
  handleInvestigationBack: () => void;
  handleLoadingComplete: () => void;
  handleDraftReviewChange: (review: DraftReviewInput) => void;
  handleDraftSubmit: (review: DraftReviewInput) => Promise<void>;
  handleGenerationRetry: () => Promise<void>;
  handleGenerationBack: () => void;
  handleRegenerate: () => Promise<void>;
  handleRegenerationRetry: () => Promise<void>;
  handleRegenerationBack: () => void;
  handleSelectedVariantIdsChange: (ids: string[]) => void;
  setVariantConfirmed: (value: boolean) => void;
  setMetaPublished: (value: boolean) => void;
}

const CampaignFlowContext = createContext<CampaignFlowContextValue | null>(
  null
);

export function CampaignFlowProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [variantConfirmed, setVariantConfirmed] = useState(false);
  const [metaPublished, setMetaPublished] = useState(false);
  const [isGeneratingAds, setIsGeneratingAds] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [loadingStepsDone, setLoadingStepsDone] = useState(false);
  const [apiDone, setApiDone] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [hasRestored, setHasRestored] = useState(false);

  const goToStep = useCallback(
    (next: AppStep) => {
      setStep(next);
      const href = pathForStep(next);
      if (pathname !== href) {
        router.push(href);
      }
    },
    [pathname, router]
  );

  useEffect(() => {
    if (hasRestored) return;

    const { snapshot } = hydrateFromStorage();
    if (!snapshot || snapshot.currentStep === "form") {
      if (snapshot?.briefInput) {
        setBrief(snapshot.briefInput);
      }
      setHasRestored(true);
      return;
    }

    setBrief(snapshot.briefInput);
    setDraft(snapshot.aiDraft);
    setDraftReview(snapshot.draftReview);
    setVariants(snapshot.adVariants ?? []);
    setSelectedVariantIds(
      Array.isArray(snapshot.selectedVariantIds)
        ? snapshot.selectedVariantIds
        : typeof snapshot.selectedVariantId === "string" &&
            snapshot.selectedVariantId
          ? [snapshot.selectedVariantId]
          : []
    );
    setVariantConfirmed(snapshot.variantConfirmed ?? false);
    setMetaPublished(snapshot.metaPublished ?? false);
    setStep(snapshot.currentStep);
    setLoadingStepsDone(true);
    setApiDone(Boolean(snapshot.aiDraft));
    setHasRestored(true);

    const target = pathForStep(snapshot.currentStep);
    if (pathname !== target) {
      router.replace(target);
    }
  }, [hasRestored, hydrateFromStorage, pathname, router]);

  useEffect(() => {
    const routeStep = stepFromPathname(pathname);
    if (routeStep) {
      setStep(routeStep);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isHydrated || !hasRestored) return;

    saveSession({
      currentStep: step,
      briefInput: brief,
      aiDraft: draft,
      draftReview,
      adVariants: variants.length > 0 ? variants : null,
      selectedVariantIds,
      variantConfirmed,
      metaPublished,
    });
  }, [
    isHydrated,
    hasRestored,
    step,
    brief,
    draft,
    draftReview,
    variants,
    selectedVariantIds,
    variantConfirmed,
    metaPublished,
    saveSession,
  ]);

  useEffect(() => {
    if (step === "loading" && loadingStepsDone && apiDone && draft) {
      goToStep("draft");
    }
  }, [step, loadingStepsDone, apiDone, draft, goToStep]);

  // Route guards after hydrate
  useEffect(() => {
    if (!isHydrated || !hasRestored) return;

    const routeStep = stepFromPathname(pathname);
    if (!routeStep) return;

    if (routeStep === "loading") {
      if (!brief && !isInvestigating) {
        router.replace(pathForStep("form"));
        return;
      }
    }

    if (routeStep === "draft" && !draft) {
      router.replace(pathForStep(brief ? "loading" : "form"));
      return;
    }

    if (routeStep === "gallery" && (!brief || variants.length === 0)) {
      router.replace(pathForStep(draft ? "draft" : "form"));
    }
  }, [
    isHydrated,
    hasRestored,
    pathname,
    brief,
    draft,
    variants.length,
    isInvestigating,
    router,
  ]);

  const handleStartNewCampaign = useCallback(() => {
    clearSession();
    setBrief(null);
    setDraft(null);
    setDraftReview(null);
    setVariants([]);
    setSelectedVariantIds([]);
    setVariantConfirmed(false);
    setMetaPublished(false);
    setApiError(null);
    setLoadingStepsDone(false);
    setApiDone(false);
    setIsGeneratingAds(false);
    setIsRegenerating(false);
    setIsInvestigating(false);
    goToStep("form");
  }, [clearSession, goToStep]);

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
      setSelectedVariantIds([]);
      setVariantConfirmed(false);
      setMetaPublished(false);
      setIsInvestigating(true);
      setApiError(null);
      setDraft(null);
      setLoadingStepsDone(false);
      setApiDone(false);
      goToStep("loading");
      await runInvestigation(input);
    },
    [goToStep, runInvestigation]
  );

  const handleInvestigationRetry = useCallback(async () => {
    if (!brief) return;
    goToStep("loading");
    await runInvestigation(brief);
  }, [brief, goToStep, runInvestigation]);

  const handleInvestigationBack = useCallback(() => {
    setApiError(null);
    goToStep("form");
  }, [goToStep]);

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
        goToStep("gallery");
      } catch (error) {
        setApiError({
          message: getErrorMessage(error),
          context: "generation",
        });
      } finally {
        setIsGeneratingAds(false);
      }
    },
    [brief, goToStep]
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
      setSelectedVariantIds([]);
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
    goToStep("draft");
  }, [goToStep]);

  const handleSelectedVariantIdsChange = useCallback((ids: string[]) => {
    setSelectedVariantIds(ids);
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

  const value = useMemo<CampaignFlowContextValue>(
    () => ({
      isHydrated: isHydrated && hasRestored,
      step,
      brief,
      draft,
      draftReview,
      variants,
      selectedVariantIds,
      variantConfirmed,
      metaPublished,
      isGeneratingAds,
      isRegenerating,
      isInvestigating,
      apiDone,
      apiError,
      restoreNotice,
      setRestoreNotice,
      showInvestigationError,
      showGenerationError,
      showRegenerationError,
      handleStartNewCampaign,
      handleBriefSubmit,
      handleInvestigationRetry,
      handleInvestigationBack,
      handleLoadingComplete,
      handleDraftReviewChange,
      handleDraftSubmit,
      handleGenerationRetry,
      handleGenerationBack,
      handleRegenerate,
      handleRegenerationRetry,
      handleRegenerationBack,
      handleSelectedVariantIdsChange,
      setVariantConfirmed,
      setMetaPublished,
    }),
    [
      isHydrated,
      hasRestored,
      step,
      brief,
      draft,
      draftReview,
      variants,
      selectedVariantIds,
      variantConfirmed,
      metaPublished,
      isGeneratingAds,
      isRegenerating,
      isInvestigating,
      apiDone,
      apiError,
      restoreNotice,
      setRestoreNotice,
      showInvestigationError,
      showGenerationError,
      showRegenerationError,
      handleStartNewCampaign,
      handleBriefSubmit,
      handleInvestigationRetry,
      handleInvestigationBack,
      handleLoadingComplete,
      handleDraftReviewChange,
      handleDraftSubmit,
      handleGenerationRetry,
      handleGenerationBack,
      handleRegenerate,
      handleRegenerationRetry,
      handleRegenerationBack,
      handleSelectedVariantIdsChange,
    ]
  );

  return (
    <CampaignFlowContext.Provider value={value}>
      {children}
    </CampaignFlowContext.Provider>
  );
}

export function useCampaignFlow(): CampaignFlowContextValue {
  const ctx = useContext(CampaignFlowContext);
  if (!ctx) {
    throw new Error(
      "useCampaignFlow debe usarse dentro de CampaignFlowProvider"
    );
  }
  return ctx;
}
