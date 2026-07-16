"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { publishToMeta, selectVariant } from "@/lib/api";
import {
  AdFormat,
  AdVariant,
  BUDGET_PER_VARIANT_SOLES,
  CampanaObjetivo,
  DEFAULT_CAMPANA_OBJETIVO,
  MAX_SELECTED_VARIANTS,
  MIN_SELECTED_VARIANTS,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ApiErrorState } from "@/components/ApiErrorState";
import { CampaignObjectiveSelector } from "@/components/CampaignObjectiveSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { VariantCard } from "@/components/VariantCard";
import { VariantDetailModal } from "@/components/VariantDetailModal";

interface VariantGalleryProps {
  variants: AdVariant[];
  format: AdFormat;
  campanaId: string | null;
  selectedVariantIds: string[];
  variantConfirmed: boolean;
  metaPublished: boolean;
  onSelectedVariantIdsChange: (ids: string[]) => void;
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

function isPaymentConfigError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("método de pago") || lower.includes("pago");
}

export function VariantGallery({
  variants,
  format,
  campanaId,
  selectedVariantIds,
  variantConfirmed,
  metaPublished,
  onSelectedVariantIdsChange,
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
  const [presupuestoTotal, setPresupuestoTotal] = useState("");
  const [presupuestoError, setPresupuestoError] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState<CampanaObjetivo>(
    DEFAULT_CAMPANA_OBJETIVO
  );

  const maxSelectable = Math.min(MAX_SELECTED_VARIANTS, variants.length);
  const selectedCount = selectedVariantIds.length;
  const hasMinSelection = selectedCount >= MIN_SELECTED_VARIANTS;
  const atMaxSelection = selectedCount >= maxSelectable;
  const minPresupuesto = selectedCount * BUDGET_PER_VARIANT_SOLES;

  const presupuestoValue = parseFloat(presupuestoTotal);
  const hasValidPresupuesto =
    !Number.isNaN(presupuestoValue) && presupuestoValue > 0;
  const presupuestoPorVariante =
    hasValidPresupuesto && selectedCount > 0
      ? presupuestoValue / selectedCount
      : null;
  const isLowBudgetPerVariant =
    presupuestoPorVariante !== null &&
    presupuestoPorVariante < BUDGET_PER_VARIANT_SOLES;

  const detailVariant = useMemo(
    () => variants.find((variant) => variant.id === detailVariantId) ?? null,
    [variants, detailVariantId]
  );

  useEffect(() => {
    if (!hasMinSelection) {
      setPresupuestoTotal("");
      setPresupuestoError(null);
      return;
    }

    setPresupuestoTotal((prev) => {
      const current = parseFloat(prev);
      if (!prev || Number.isNaN(current) || current <= 0) {
        return String(minPresupuesto);
      }
      return prev;
    });
  }, [hasMinSelection, minPresupuesto]);

  function toggleVariant(id: string) {
    if (selectedVariantIds.includes(id)) {
      onSelectedVariantIdsChange(
        selectedVariantIds.filter((selectedId) => selectedId !== id)
      );
      return;
    }

    if (atMaxSelection) return;

    onSelectedVariantIdsChange([...selectedVariantIds, id]);
  }

  async function handleConfirm() {
    if (!hasMinSelection || !campanaId) return;

    setIsConfirming(true);
    setConfirmError(null);

    try {
      await selectVariant(selectedVariantIds, campanaId);
      onVariantConfirmed();
      setShowConfirmToast(true);
    } catch (error) {
      setConfirmError(getErrorMessage(error));
    } finally {
      setIsConfirming(false);
    }
  }

  async function handlePublishToMeta() {
    if (!hasMinSelection || !campanaId) return;

    if (!hasValidPresupuesto) {
      setPresupuestoError(
        "Ingresa un presupuesto diario mayor a 0 para publicar"
      );
      return;
    }

    setIsPublishing(true);
    setPublishError(null);
    setPresupuestoError(null);

    try {
      await publishToMeta({
        campana_id: campanaId,
        variante_ids: selectedVariantIds,
        presupuesto_total: presupuestoValue,
        objetivo,
      });
      onMetaPublished();
      setShowPublishToast(true);
    } catch (error) {
      setPublishError(getErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  }

  function handleSelectFromDetail(id: string) {
    const alreadySelected = selectedVariantIds.includes(id);
    if (!alreadySelected && atMaxSelection) return;
    toggleVariant(id);
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
            {variants.length} variantes generadas — selecciona de{" "}
            {MIN_SELECTED_VARIANTS} a {maxSelectable} para publicar
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
          tone={isPaymentConfigError(publishError) ? "warning" : "error"}
          title={
            isPaymentConfigError(publishError)
              ? "Configuración requerida en Meta Ads"
              : "No se pudo publicar en Meta Ads"
          }
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
              isSelected={selectedVariantIds.includes(variant.id)}
              selectionDisabled={atMaxSelection}
              onSelect={toggleVariant}
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
              Publicando{" "}
              {selectedCount === 1
                ? "1 variante"
                : `${selectedCount} variantes`}{" "}
              en Meta Ads...
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
            Ya publicado en Meta Ads (
            {selectedCount === 1
              ? "1 variante"
              : `${selectedCount} variantes`}
            )
          </p>
        </div>
      )}

      {!metaPublished && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-brand-black via-brand-black to-transparent">
          {!hasMinSelection && (
            <p className="mb-3 text-center text-sm text-neutral-400">
              Selecciona al menos {MIN_SELECTED_VARIANTS} variante para publicar
              {selectedCount > 0 ? ` (${selectedCount} de ${maxSelectable})` : ""}
            </p>
          )}

          {hasMinSelection && !variantConfirmed && (
            <p className="mb-3 text-center text-sm text-neutral-400">
              {selectedCount === 1
                ? "1 variante seleccionada"
                : `${selectedCount} variantes seleccionadas`}
            </p>
          )}

          {hasMinSelection && variantConfirmed && (
            <div className="mb-4 max-w-md mx-auto w-full flex flex-col gap-4">
              <CampaignObjectiveSelector
                value={objetivo}
                onChange={setObjetivo}
                disabled={isPublishing}
              />
              <Input
                label="Presupuesto diario total (S/)"
                type="number"
                min={0}
                step="1"
                prefix="S/"
                value={presupuestoTotal}
                onChange={(e) => {
                  setPresupuestoTotal(e.target.value);
                  setPresupuestoError(null);
                }}
                error={presupuestoError ?? undefined}
                disabled={isPublishing}
              />
              <div className="flex flex-col gap-1.5 text-xs leading-relaxed">
                <p className="text-neutral-500">
                  Sugerido: al menos {formatCurrency(minPresupuesto)}/día para
                  que Meta pueda entregar bien{" "}
                  {selectedCount === 1
                    ? "el anuncio"
                    : "cada anuncio"}
                  .
                </p>
                {hasValidPresupuesto && selectedCount > 0 && (
                  <p className="text-neutral-400">
                    {selectedCount === 1
                      ? `Con ${formatCurrency(presupuestoValue)} para 1 variante, tendrá un presupuesto diario de ${formatCurrency(presupuestoPorVariante!)}.`
                      : `Con ${formatCurrency(presupuestoValue)} repartidos entre ${selectedCount} variantes, cada una tendrá un presupuesto diario de ${formatCurrency(presupuestoPorVariante!)}.`}
                  </p>
                )}
                {isLowBudgetPerVariant && (
                  <p className="text-amber-400">
                    Este monto es bajo por variante — Meta podría no entregar el
                    anuncio de forma óptima o rechazar el presupuesto mínimo
                    permitido.
                  </p>
                )}
              </div>
            </div>
          )}

          {!variantConfirmed ? (
            <Button
              type="button"
              fullWidth
              onClick={handleConfirm}
              disabled={!hasMinSelection || isConfirming || !campanaId}
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
          ) : (
            <Button
              type="button"
              fullWidth
              onClick={handlePublishToMeta}
              disabled={
                !hasMinSelection ||
                !hasValidPresupuesto ||
                isPublishing ||
                !campanaId
              }
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                `Publicar ${selectedCount} ${
                  selectedCount === 1 ? "variante" : "variantes"
                } en Meta Ads`
              )}
            </Button>
          )}
        </div>
      )}

      <VariantDetailModal
        variant={detailVariant}
        format={format}
        isOpen={detailVariantId !== null}
        isSelected={
          detailVariantId !== null &&
          selectedVariantIds.includes(detailVariantId)
        }
        onClose={() => setDetailVariantId(null)}
        onSelect={handleSelectFromDetail}
      />

      {showConfirmToast && (
        <Toast
          message={
            selectedCount === 1
              ? "1 variante seleccionada — lista para publicar en Meta Ads"
              : `${selectedCount} variantes seleccionadas — listas para publicar en Meta Ads`
          }
          onClose={() => setShowConfirmToast(false)}
        />
      )}

      {showPublishToast && (
        <Toast
          message={
            selectedCount === 1
              ? "Anuncio creado en Meta Ads Manager (estado: Pausado). Revísalo y actívalo cuando estés listo."
              : "Anuncios creados en Meta Ads Manager (estado: Pausado). Revísalos y actívalos cuando estés listo."
          }
          onClose={() => setShowPublishToast(false)}
          duration={6000}
        />
      )}
    </div>
  );
}
