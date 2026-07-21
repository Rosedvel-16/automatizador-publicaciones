"use client";

import { ApiErrorState } from "@/components/ApiErrorState";
import { DraftReview } from "@/components/DraftReview";
import { useCampaignFlow } from "@/hooks/useCampaignFlow";

export default function BorradorPage() {
  const {
    draft,
    draftReview,
    apiError,
    isGeneratingAds,
    showGenerationError,
    handleDraftReviewChange,
    handleDraftSubmit,
    handleGenerationRetry,
    handleGenerationBack,
  } = useCampaignFlow();

  if (!draft) {
    return (
      <p className="text-sm text-neutral-500">Preparando borrador...</p>
    );
  }

  return (
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
  );
}
