"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AdFormat, AdVariant } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { VariantCard } from "@/components/VariantCard";

interface VariantGalleryProps {
  variants: AdVariant[];
  format: AdFormat;
  onRegenerate: () => Promise<void>;
  isRegenerating?: boolean;
}

export function VariantGallery({
  variants,
  format,
  onRegenerate,
  isRegenerating = false,
}: VariantGalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  function handleConfirm() {
    if (!selectedId) return;
    setShowToast(true);
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-white mb-1">
            Variantes de anuncio
          </h2>
          <p className="text-sm text-neutral-500">
            {variants.length} variantes generadas — selecciona la que mejor
            represente tu campaña
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="shrink-0"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant, index) => (
          <div
            key={variant.id}
            className={`animate-slide-up animate-delay-${Math.min(index * 100, 300)}`}
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <VariantCard
              variant={variant}
              format={format}
              isSelected={selectedId === variant.id}
              onSelect={setSelectedId}
            />
          </div>
        ))}
      </div>

      {selectedId && (
        <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-brand-black via-brand-black to-transparent">
          <Button type="button" fullWidth onClick={handleConfirm}>
            Confirmar y continuar
          </Button>
        </div>
      )}

      {showToast && (
        <Toast
          message="Variante seleccionada — lista para publicar en Meta Ads"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
