"use client";

import { ApiErrorState } from "@/components/ApiErrorState";
import { LoadingSteps } from "@/components/LoadingSteps";
import { useCampaignFlow } from "@/hooks/useCampaignFlow";

export default function InvestigacionPage() {
  const {
    apiError,
    apiDone,
    isInvestigating,
    showInvestigationError,
    handleInvestigationRetry,
    handleInvestigationBack,
    handleLoadingComplete,
  } = useCampaignFlow();

  if (showInvestigationError && apiError) {
    return (
      <ApiErrorState
        message={apiError.message}
        onRetry={handleInvestigationRetry}
        onBack={handleInvestigationBack}
        backLabel="Volver al formulario"
        isRetrying={isInvestigating}
      />
    );
  }

  return (
    <LoadingSteps onComplete={handleLoadingComplete} apiDone={apiDone} />
  );
}
