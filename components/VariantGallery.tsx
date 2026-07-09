"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { publishToMeta, selectVariant } from "@/lib/api";
import { AdFormat, AdVariant } from "@/lib/types";
import { ApiErrorState } from "@/components/ApiErrorState";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { VariantCard } from "@/components/VariantCard";
import { VariantDetailModal } from "@/components/VariantDetailModal";

interface VariantGalleryProps {
  variants: AdVariant[];
  format: AdFormat;
  campanaId: string | null;
  selectedVariantId: string | null;
  variantConfirmed: boolean;
  metaPublished: boolean;
  onSelectedVariantChange: (id: string) => void;
  onVariantConfirmed: () => void;
  onMetaPublished: () => void;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
  onStartNewCampaign?: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

export function VariantGallery({
  variants,
  format,
  campanaId,
  selectedVariantId,
  variantConfirmed,
  metaPublished,
  onSelectedVariantChange,
  onVariantConfirmed,
  onMetaPublished,
  onRegenerate,
  isRegenerating = false,
  onStartNewCampaign,
}: VariantGalleryProps) {
  const [detailVariantId, setDetailVariantId] = useState<string | null>(null);
  const [showConfirmToast, setShowConfirmToast] = useState(false);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const detailVariant = useMemo(
    () => variants.find((variant) => variant.id === detailVariantId) ?? null,
    [variants, detailVariantId]
  );

  async function handleConfirm() {
    if (!selectedVariantId || !campanaId) return;

    setIsConfirming(true);
    setConfirmError(null);

    try {
      await selectVariant(selectedVariantId, campanaId);
      onVariantConfirmed();
      setShowConfirmToast(true);
    } catch (error) {
      setConfirmError(getErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  }

  async function handlePublishToMeta() {
    if (!selectedVariantId || !campanaId) return;

    setIsPublishing(true);
    setPublishError(null);

    try {
      await publishToMeta(campanaId, selectedVariantId);
      onMetaPublished();
      setShowPublishToast(true);
    } catch (error) {
      const detail = getErrorMessage(error);
      setPublishError(
        `No se pudo publicar en Meta Ads. ${detail}. Puedes reintentar o revisar manualmente en Meta Ads Manager.`
      );
    } finally {
      setIsPublishing(false);
    }
  }

  function handleSelectVariant(id: string) {
    onSelectedVariantChange(id);
    setDetailVariantId(null);
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-white mb-1">
            Variantes de anuncio
          </h2>
          <p className="text-sm text-neutral-500">
            {variants.length} variantes generadas — selecciona la que mejor
            represente tu campaña
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={onRegenerate}
            disabled={isRegenerating || isPublishing}
          >
            {isRegenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Regenerando...
              </>
            ) : (
              "Regenerar variantes"
            )}
          </Button>
          {onStartNewCampaign && (
            <button
              type="button"
              onClick={onStartNewCampaign}
              className="text-xs text-neutral-500 underline underline-offset-2 transition-colors hover:text-brand-white"
            >
              Empezar nueva campaña
            </button>
          )}
        </div>
      </div>

      {confirmError && (
        <ApiErrorState
          message={confirmError}
          onRetry={handleConfirm}
          onBack={() => setConfirmError(null)}
          backLabel="Cerrar"
          isRetrying={isConfirming}
        />
      )}

      {publishError && (
        <ApiErrorState
          message={publishError}
          onRetry={handlePublishToMeta}
          onBack={() => setPublishError(null)}
          backLabel="Cerrar"
          isRetrying={isPublishing}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant, index) => (
          <div
            key={variant.id}
            className={`h-full animate-slide-up animate-delay-${Math.min(index * 100, 300)}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <VariantCard
              variant={variant}
              format={format}
              isSelected={selectedVariantId === variant.id}
              onSelect={onSelectedVariantChange}
              onOpenDetail={() => setDetailVariantId(variant.id)}
            />
          </div>
        ))}
      </div>

      {isPublishing && (
        <div
          className="flex items-start gap-3 border border-brand-yellow/30 bg-brand-yellow/5 px-4 py-4"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="w-5 h-5 shrink-0 animate-spin text-brand-yellow mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-brand-white">
              Publicando en Meta Ads...
            </p>
            <p className="text-sm text-neutral-400 mt-1">
              Esto puede tardar un momento (20–40 segundos aprox.).
            </p>
          </div>
        </div>
      )}

      {metaPublished && (
        <div className="flex items-center gap-3 border border-brand-yellow/30 bg-brand-yellow/5 px-4 py-4">
          <Check className="w-5 h-5 shrink-0 text-brand-yellow" />
          <p className="text-sm text-brand-white">
            Ya publicado en Meta Ads
          </p>
        </div>
      )}

      {selectedVariantId && !variantConfirmed && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-brand-black via-brand-black to-transparent">
          <Button
            type="button"
            fullWidth
            onClick={handleConfirm}
            disabled={isConfirming || !campanaId}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Confirmar y continuar"
            )}
          </Button>
        </div>
      )}

      {selectedVariantId && variantConfirmed && !metaPublished && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-brand-black via-brand-black to-transparent">
          <Button
            type="button"
            fullWidth
            onClick={handlePublishToMeta}
            disabled={isPublishing || !campanaId}
          >
            Publicar en Meta Ads
          </Button>
        </div>
      )}

      <VariantDetailModal
        variant={detailVariant}
        format={format}
        isOpen={detailVariantId !== null}
        isSelected={
          detailVariantId !== null && selectedVariantId === detailVariantId
        }
        onClose={() => setDetailVariantId(null)}
        onSelect={handleSelectVariant}
      />

      {showConfirmToast && (
        <Toast
          message="Variante seleccionada — lista para publicar en Meta Ads"
          onClose={() => setShowConfirmToast(false)}
        />
      )}

      {showPublishToast && (
        <Toast
          message="Anuncio creado en Meta Ads Manager (estado: Pausado). Revísalo y actívalo cuando estés listo."
          onClose={() => setShowPublishToast(false)}
          duration={6000}
        />
      )}
    </div>
  );
}
