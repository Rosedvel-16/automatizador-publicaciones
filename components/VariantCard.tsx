"use client";

import { Check, Maximize2 } from "lucide-react";
import { AdFormat, AdVariant } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface VariantCardProps {
  variant: AdVariant;
  format: AdFormat;
  isSelected: boolean;
  selectionDisabled?: boolean;
  onSelect: (id: string) => void;
  onOpenDetail: () => void;
}

const FORMAT_ASPECT_CLASS: Record<AdFormat, string> = {
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "1.91:1": "aspect-[1.91/1]",
};

export function VariantCard({
  variant,
  format,
  isSelected,
  selectionDisabled = false,
  onSelect,
  onOpenDetail,
}: VariantCardProps) {
  return (
    <article
      className={[
        "flex h-full flex-col border transition-all duration-200 animate-slide-up",
        isSelected
          ? "border-brand-yellow ring-1 ring-brand-yellow/50"
          : "border-neutral-800 hover:border-neutral-600",
      ].join(" ")}
    >
      <div
        className={[
          "relative isolate w-full shrink-0 overflow-hidden bg-neutral-900 group",
          FORMAT_ASPECT_CLASS[format],
        ].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={variant.imageUrl}
          alt={`Preview del anuncio: ${variant.titulo}`}
          className="absolute inset-0 block h-full w-full min-h-full min-w-full object-cover object-center transition-opacity group-hover:opacity-90"
          loading="lazy"
          decoding="async"
        />

        <button
          type="button"
          onClick={onOpenDetail}
          className="absolute inset-0 z-[1] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-yellow"
          aria-label={`Ver detalle de ${variant.titulo}`}
        />

        <div
          className={[
            "absolute top-2 left-2 z-10 flex h-7 w-7 items-center justify-center border transition-colors",
            isSelected
              ? "border-brand-yellow bg-brand-yellow text-brand-black"
              : "border-neutral-600 bg-brand-black/70 text-transparent",
          ].join(" ")}
          aria-hidden
        >
          <Check className="h-4 w-4" strokeWidth={3} />
        </div>

        <button
          type="button"
          onClick={onOpenDetail}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center border border-neutral-700/80 bg-brand-black/70 text-brand-white backdrop-blur-sm transition-colors hover:border-brand-yellow/60 hover:text-brand-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
          aria-label="Expandir detalle"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <button
          type="button"
          onClick={onOpenDetail}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
        >
          <h3 className="text-sm font-bold text-brand-white leading-snug hover:text-brand-yellow transition-colors">
            {variant.titulo}
          </h3>
        </button>

        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
          {variant.copy_principal}
        </p>

        <div className="mt-auto pt-2 flex flex-col gap-3">
          <span className="inline-flex self-start px-3 py-1.5 text-xs font-semibold border border-neutral-700 text-brand-white bg-neutral-900">
            {variant.cta}
          </span>

          <Button
            type="button"
            variant={isSelected ? "primary" : "secondary"}
            fullWidth
            disabled={!isSelected && selectionDisabled}
            onClick={() => onSelect(variant.id)}
            aria-pressed={isSelected}
          >
            {isSelected ? "Seleccionada" : "Seleccionar"}
          </Button>
        </div>
      </div>
    </article>
  );
}
