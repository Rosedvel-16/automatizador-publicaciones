"use client";

import { CampanaObjetivo } from "@/lib/types";

interface ObjectiveOption {
  value: CampanaObjetivo;
  label: string;
  help: string;
  disabled?: boolean;
  badge?: string;
}

const OBJECTIVE_OPTIONS: ObjectiveOption[] = [
  {
    value: "difusion",
    label: "Difusión",
    help: "Muestra tu anuncio a la mayor cantidad de personas posible",
  },
  {
    value: "interaccion",
    label: "Interacción",
    help: "Prioriza likes, comentarios y compartidos",
  },
  {
    value: "trafico",
    label: "Tráfico",
    help: "Prioriza que la gente haga clic y visite tu link",
  },
  {
    value: "conversion",
    label: "Conversión",
    help: "Prioriza ventas — requiere configuración adicional aún no disponible",
    disabled: true,
    badge: "Próximamente",
  },
];

interface CampaignObjectiveSelectorProps {
  value: CampanaObjetivo;
  onChange: (value: CampanaObjetivo) => void;
  disabled?: boolean;
}

export function CampaignObjectiveSelector({
  value,
  onChange,
  disabled = false,
}: CampaignObjectiveSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-brand-white">
        Objetivo de campaña
      </p>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        role="radiogroup"
        aria-label="Objetivo de campaña"
      >
        {OBJECTIVE_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || Boolean(option.disabled);

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              title={option.help}
              onClick={() => {
                if (!isDisabled) onChange(option.value);
              }}
              className={[
                "relative flex flex-col items-start gap-1.5 px-3.5 py-3 text-left",
                "rounded-sm border bg-brand-black transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
                option.disabled
                  ? "border-neutral-800 text-neutral-600 opacity-60 cursor-not-allowed"
                  : isSelected
                    ? "border-brand-yellow ring-1 ring-brand-yellow/40"
                    : "border-neutral-700 hover:border-neutral-500",
              ].join(" ")}
            >
              <span className="inline-flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "text-sm font-semibold",
                    option.disabled
                      ? "text-neutral-500"
                      : isSelected
                        ? "text-brand-yellow"
                        : "text-brand-white",
                  ].join(" ")}
                >
                  {option.label}
                </span>
                {option.badge && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 border border-neutral-700 text-neutral-500">
                    {option.badge}
                  </span>
                )}
              </span>
              <span
                className={[
                  "text-[11px] leading-relaxed",
                  option.disabled ? "text-neutral-600" : "text-neutral-500",
                ].join(" ")}
              >
                {option.help}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
