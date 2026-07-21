"use client";

import { ApiErrorState } from "@/components/ApiErrorState";
import { VariantGallery } from "@/components/VariantGallery";
import { useCampaignFlow } from "@/hooks/useCampaignFlow";

export default function AnunciosPage() {
  const {
    brief,
    draft,
    draftReview,
    variants,
    selectedVariantIds,
    variantConfirmed,
    metaPublished,
    apiError,
    isRegenerating,
    showRegenerationError,
    handleSelectedVariantIdsChange,
    setVariantConfirmed,
    setMetaPublished,
    handleRegenerate,
    handleRegenerationRetry,
    handleRegenerationBack,
    handleStartNewCampaign,
  } = useCampaignFlow();

  if (!brief) {
    return (
      <p className="text-sm text-neutral-500">Cargando anuncios...</p>
    );
  }

  return (
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
        selectedVariantIds={selectedVariantIds}
        variantConfirmed={variantConfirmed}
        metaPublished={metaPublished}
        onSelectedVariantIdsChange={handleSelectedVariantIdsChange}
        onVariantConfirmed={() => setVariantConfirmed(true)}
        onMetaPublished={() => setMetaPublished(true)}
        onRegenerate={handleRegenerate}
        isRegenerating={isRegenerating}
        onStartNewCampaign={handleStartNewCampaign}
      />
    </>
  );
}
