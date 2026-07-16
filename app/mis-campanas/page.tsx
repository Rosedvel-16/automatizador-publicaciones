"use client";

import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { listarCampanas, publishToMeta } from "@/lib/api";
import {
  BUDGET_PER_VARIANT_SOLES,
  Campana,
  CampanaObjetivo,
  DEFAULT_CAMPANA_OBJETIVO,
} from "@/lib/types";
import { formatCampanaDate, formatCurrency } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { CampaignObjectiveSelector } from "@/components/CampaignObjectiveSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  en_investigacion: {
    label: "En investigación",
    className: "bg-neutral-800 text-neutral-400 border-neutral-700",
  },
  variante_seleccionada: {
    label: "Variante seleccionada",
    className: "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/40",
  },
  publicada: {
    label: "Publicada",
    className: "bg-brand-ink text-brand-white border-neutral-600",
  },
};

function getStatusConfig(status: string) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status.replaceAll("_", " "),
      className: "bg-neutral-800 text-neutral-400 border-neutral-700",
    }
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "No se pudieron cargar las campañas";
}

function CampaignCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 border border-neutral-800 bg-neutral-900/40 p-5 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="h-6 bg-neutral-800 rounded w-28" />
        <div className="h-4 w-4 bg-neutral-800 rounded shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-full" />
        <div className="h-4 bg-neutral-800 rounded w-4/5" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-neutral-800 rounded w-full" />
        <div className="h-4 bg-neutral-800 rounded w-3/4" />
      </div>
      <div className="h-3 bg-neutral-800 rounded w-32" />
    </div>
  );
}

function normalizeInlineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

interface CampaignCardProps {
  campana: Campana;
  onCampanaUpdated: (campana: Campana) => void;
}

function CampaignCard({ campana, onCampanaUpdated }: CampaignCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [presupuestoTotal, setPresupuestoTotal] = useState(
    String(BUDGET_PER_VARIANT_SOLES)
  );
  const [presupuestoError, setPresupuestoError] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState<CampanaObjetivo>(
    DEFAULT_CAMPANA_OBJETIVO
  );

  const status = getStatusConfig(campana.status);
  const canPublish = Boolean(campana.variante_seleccionada_id);
  const showMetaPublished = Boolean(campana.meta_campaign_id);
  const metaAdsManagerUrl = campana.meta_campaign_id
    ? `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=1576952164432427&selected_campaign_ids=${campana.meta_campaign_id}`
    : null;
  const titulo = normalizeInlineText(campana.tema_busqueda);
  const dolor = normalizeInlineText(campana.dolor_principal);
  const minPresupuesto = BUDGET_PER_VARIANT_SOLES;
  const presupuestoValue = parseFloat(presupuestoTotal);
  const hasValidPresupuesto =
    !Number.isNaN(presupuestoValue) && presupuestoValue > 0;
  const isLowBudget =
    hasValidPresupuesto && presupuestoValue < BUDGET_PER_VARIANT_SOLES;

  function toggleExpanded() {
    setIsExpanded((prev) => !prev);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
    }
  }

  async function handlePublish(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!campana.variante_seleccionada_id || isPublishing) return;

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
      const result = await publishToMeta({
        campana_id: campana.id,
        variante_ids: [campana.variante_seleccionada_id],
        presupuesto_total: presupuestoValue,
        objetivo,
      });

      onCampanaUpdated({
        ...campana,
        status: "publicada",
        meta_campaign_id: result.meta_campaign_id,
        meta_adset_id: result.meta_adset_id ?? campana.meta_adset_id,
        meta_ad_id: result.meta_ad_id ?? campana.meta_ad_id,
        published_at: new Date().toISOString(),
      });
      setShowPublishToast(true);
    } catch (error) {
      setPublishError(getErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      onClick={toggleExpanded}
      onKeyDown={handleKeyDown}
      className={[
        "flex flex-col gap-3 border border-neutral-800 bg-neutral-900/40 p-5",
        "cursor-pointer transition-all duration-200 animate-fade-in",
        "hover:border-neutral-600 hover:bg-neutral-900/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={[
            "inline-flex max-w-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider border",
            status.className,
          ].join(" ")}
        >
          {status.label}
        </span>
        <ChevronDown
          className={[
            "w-4 h-4 shrink-0 text-neutral-500 transition-transform duration-200",
            isExpanded ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </div>

      <h2
        className={[
          "w-full text-sm font-semibold text-brand-white leading-relaxed break-words",
          !isExpanded && "line-clamp-2",
        ].join(" ")}
      >
        {titulo}
      </h2>

      <p
        className={[
          "w-full text-sm text-neutral-400 leading-relaxed break-words",
          !isExpanded && "line-clamp-2",
        ].join(" ")}
      >
        {dolor}
      </p>

      <div className="flex flex-col gap-2 mt-auto pt-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <p className="text-xs text-neutral-500">
            {formatCampanaDate(campana.created_at)}
          </p>
          {metaAdsManagerUrl && (
            <a
              href={metaAdsManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className={[
                "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-semibold",
                "border border-neutral-700 text-neutral-300 bg-transparent",
                "transition-colors duration-200 hover:border-neutral-500 hover:text-brand-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500",
              ].join(" ")}
            >
              Ver en Meta Ads Manager
            </a>
          )}
        </div>

        {showMetaPublished && (
          <p className="inline-flex items-center gap-1.5 text-xs text-brand-white">
            <Check className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
            Publicado en Meta Ads
          </p>
        )}

        {canPublish && (
          <div
            className="flex flex-col gap-2 pt-1"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
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
            <div className="flex flex-col gap-1.5 text-[11px] leading-relaxed">
              <p className="text-neutral-500">
                Sugerido: al menos {formatCurrency(minPresupuesto)}/día para que
                Meta pueda entregar bien el anuncio.
              </p>
              {hasValidPresupuesto && (
                <p className="text-neutral-400">
                  Con {formatCurrency(presupuestoValue)} para 1 variante, tendrá
                  un presupuesto diario de {formatCurrency(presupuestoValue)}.
                </p>
              )}
              {isLowBudget && (
                <p className="text-amber-400">
                  Este monto es bajo por variante — Meta podría no entregar el
                  anuncio de forma óptima o rechazar el presupuesto mínimo
                  permitido.
                </p>
              )}
            </div>
            <Button
              type="button"
              fullWidth
              onClick={handlePublish}
              disabled={isPublishing || !hasValidPresupuesto}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar"
              )}
            </Button>
            <p className="text-[11px] leading-relaxed text-neutral-600">
              Esto creará una nueva campaña en Meta Ads (pausada), incluso si ya
              publicaste esta antes
            </p>
            {publishError && (
              <p className="text-xs leading-relaxed text-red-400" role="alert">
                {publishError}
              </p>
            )}
          </div>
        )}
      </div>

      {showPublishToast && (
        <Toast
          message="Publicado en Meta Ads"
          onClose={() => setShowPublishToast(false)}
        />
      )}
    </article>
  );
}

export default function MisCampanasPage() {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampanas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await listarCampanas();
      setCampanas(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampanas();
  }, [loadCampanas]);

  const handleCampanaUpdated = useCallback((updated: Campana) => {
    setCampanas((prev) =>
      prev.map((campana) => (campana.id === updated.id ? updated : campana))
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-brand-white mb-2">
            Mis campañas
          </h2>
          <p className="text-sm text-neutral-500 max-w-lg">
            Historial de campañas generadas con el motor de IA — desde la
            investigación hasta la publicación en Meta Ads.
          </p>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <Loader2 className="w-4 h-4 animate-spin text-brand-yellow" />
              Cargando campañas...
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <CampaignCardSkeleton key={index} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-neutral-400 mb-6 max-w-md">{error}</p>
            <Button type="button" onClick={loadCampanas}>
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && !error && campanas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-neutral-800 bg-neutral-900/30 px-6">
            <p className="text-base font-semibold text-brand-white mb-2">
              Aún no tienes campañas creadas
            </p>
            <p className="text-sm text-neutral-500 mb-8 max-w-md">
              Completa el brief de un producto para generar tu primera campaña
              publicitaria con IA.
            </p>
            <Link href="/">
              <Button type="button">Crear primera campaña</Button>
            </Link>
          </div>
        )}

        {!isLoading && !error && campanas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campanas.map((campana) => (
              <CampaignCard
                key={campana.id}
                campana={campana}
                onCampanaUpdated={handleCampanaUpdated}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-800 mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <p className="text-xs text-neutral-600">
            Lernymart Ads Engine — Conectado a n8n · PoC v1
          </p>
        </div>
      </footer>
    </div>
  );
}
