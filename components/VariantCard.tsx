"use client";

import Image from "next/image";
import { AdFormat, AdVariant } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface VariantCardProps {
  variant: AdVariant;
  format: AdFormat;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const FORMAT_ASPECT: Record<AdFormat, string> = {
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
  "1.91:1": "aspect-[1.91/1]",
};

export function VariantCard({
  variant,
  format,
  isSelected,
  onSelect,
}: VariantCardProps) {
  return (
    <article
      className={[
        "flex flex-col border transition-all duration-200 animate-slide-up",
        isSelected
          ? "border-brand-yellow ring-1 ring-brand-yellow/50"
          : "border-neutral-800 hover:border-neutral-600",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-full overflow-hidden bg-neutral-900",
          FORMAT_ASPECT[format],
        ].join(" ")}
      >
        <Image
          src={variant.imageUrl}
          alt={`Preview del anuncio: ${variant.titulo}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-3 p-4 flex-1">
        <h3 className="text-sm font-bold text-brand-white leading-snug">
          {variant.titulo}
        </h3>

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
            onClick={() => onSelect(variant.id)}
          >
            {isSelected ? "Variante seleccionada" : "Seleccionar esta variante"}
          </Button>
        </div>
      </div>
    </article>
  );
}
