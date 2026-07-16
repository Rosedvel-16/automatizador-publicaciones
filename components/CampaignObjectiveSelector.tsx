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
  /** Una columna: evita desbordes en tarjetas angostas (Mis campañas). */
  compact?: boolean;
}

export function CampaignObjectiveSelector({
  value,
  onChange,
  disabled = false,
  compact = false,
}: CampaignObjectiveSelectorProps) {
  return (
    <div className="w-full min-w-0 flex flex-col gap-3">
      <p className="text-sm font-medium text-brand-white">
        Objetivo de campaña
      </p>
      <div
        className={[
          "grid gap-2 w-full min-w-0",
          compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2",
        ].join(" ")}
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
                "w-full min-w-0 max-w-full overflow-hidden",
                "flex flex-col items-start gap-1 px-3 py-2.5 text-left",
                "border bg-neutral-950 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
                option.disabled
                  ? "border-neutral-800 opacity-55 cursor-not-allowed"
                  : isSelected
                    ? "border-brand-yellow"
                    : "border-neutral-700 hover:border-neutral-500",
              ].join(" ")}
            >
              <span className="w-full min-w-0 flex flex-col items-start gap-1">
                <span
                  className={[
                    "text-sm font-semibold break-words",
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
                  <span className="inline-block max-w-full text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 border border-neutral-700 text-neutral-500 truncate">
                    {option.badge}
                  </span>
                )}
              </span>
              <span
                className={[
                  "w-full text-[11px] leading-relaxed break-words",
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
