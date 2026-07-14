"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AdFormat, AdVariant } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface VariantDetailModalProps {
  variant: AdVariant | null;
  format: AdFormat;
  isOpen: boolean;
  isSelected: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const FORMAT_ASPECT_CLASS: Record<AdFormat, string> = {
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "1.91:1": "aspect-[1.91/1]",
};

export function VariantDetailModal({
  variant,
  format,
  isOpen,
  isSelected,
  onClose,
  onSelect,
}: VariantDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !variant || typeof document === "undefined") return null;

  const activeVariant = variant;

  function handleSelect() {
    onSelect(activeVariant.id);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 animate-fade-in cursor-default"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-detail-title"
        className={[
          "relative z-10 flex w-full flex-col",
          "max-h-[92vh] sm:max-h-[90vh] sm:max-w-2xl",
          "rounded-t-xl sm:rounded border bg-neutral-900 shadow-2xl",
          "animate-modal-in overflow-hidden",
          isSelected
            ? "border-brand-yellow ring-1 ring-brand-yellow/40"
            : "border-neutral-800 sm:border-brand-yellow/20",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-4 py-3 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Detalle de variante
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border border-neutral-700 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-brand-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div
            className={[
              "relative isolate w-full shrink-0 overflow-hidden bg-neutral-950 sm:max-h-[420px]",
              FORMAT_ASPECT_CLASS[format],
            ].join(" ")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeVariant.imageUrl}
              alt={`Anuncio: ${activeVariant.titulo}`}
              className="absolute inset-0 block h-full w-full min-h-full min-w-full object-cover object-center"
              decoding="async"
            />
          </div>

          <div className="flex flex-col gap-4 p-4 sm:p-6">
            <h2
              id="variant-detail-title"
              className="text-lg font-bold text-brand-white leading-snug"
            >
              {activeVariant.titulo}
            </h2>

            <div className="max-h-48 sm:max-h-64 overflow-y-auto rounded border border-neutral-800 bg-brand-black/50 p-4">
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {activeVariant.copy_principal}
              </p>
            </div>

            <span className="inline-flex self-start px-3 py-1.5 text-xs font-semibold border border-neutral-700 text-brand-white bg-neutral-900">
              {activeVariant.cta}
            </span>

            <Button
              type="button"
              variant={isSelected ? "primary" : "secondary"}
              fullWidth
              onClick={handleSelect}
              aria-pressed={isSelected}
            >
              {isSelected ? "Quitar de la selección" : "Añadir a la selección"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
