"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { selectVariant } from "@/lib/api";
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
  onSelectedVariantChange: (id: string) => void;
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
  onSelectedVariantChange,
  onRegenerate,
  isRegenerating = false,
  onStartNewCampaign,
}: VariantGalleryProps) {
  const [detailVariantId, setDetailVariantId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

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
      setShowToast(true);
    } catch (error) {
      setConfirmError(getErrorMessage(error));
    } finally {
      setIsConfirming(false);
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
            disabled={isRegenerating}
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

      {selectedVariantId && (
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

      {showToast && (
        <Toast
          message="Variante seleccionada — lista para publicar en Meta Ads"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
