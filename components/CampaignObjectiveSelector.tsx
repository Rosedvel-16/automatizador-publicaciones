"use client";

import {
  CampanaObjetivo,
  DEFAULT_CAMPANA_OBJETIVO,
} from "@/lib/types";

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
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="text-sm font-medium text-brand-white mb-1">
        Objetivo de campaña
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup">
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
                "flex flex-col items-start gap-1 px-3 py-2.5 border text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow",
                option.disabled
                  ? "border-neutral-800 bg-neutral-950/40 opacity-50 cursor-not-allowed"
                  : isSelected
                    ? "border-brand-yellow bg-brand-yellow/5"
                    : "border-neutral-700 bg-neutral-900/50 hover:border-neutral-500",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-2">
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
              <span className="text-[11px] leading-relaxed text-neutral-500">
                {option.help}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export { DEFAULT_CAMPANA_OBJETIVO };
