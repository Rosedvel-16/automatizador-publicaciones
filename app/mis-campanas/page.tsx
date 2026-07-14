"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { listarCampanas } from "@/lib/api";
import { Campana } from "@/lib/types";
import { formatCampanaDate } from "@/lib/utils";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  en_investigacion: {
    label: "En investigación",
    className:
      "bg-neutral-800 text-neutral-400 border-neutral-700",
  },
  variante_seleccionada: {
    label: "Variante seleccionada",
    className:
      "bg-brand-yellow/10 text-brand-yellow border-brand-yellow/40",
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

function CampaignCard({ campana }: { campana: Campana }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getStatusConfig(campana.status);
  const showMetaPublished =
    campana.status === "publicada" && Boolean(campana.meta_ad_id);
  const titulo = normalizeInlineText(campana.tema_busqueda);
  const dolor = normalizeInlineText(campana.dolor_principal);

  function toggleExpanded() {
    setIsExpanded((prev) => !prev);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpanded();
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
        <p className="text-xs text-neutral-500">
          {formatCampanaDate(campana.created_at)}
        </p>

        {showMetaPublished && (
          <p className="inline-flex items-center gap-1.5 text-xs text-brand-white">
            <Check className="w-3.5 h-3.5 text-brand-yellow shrink-0" />
            Publicado en Meta Ads
          </p>
        )}
      </div>
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
              <CampaignCard key={campana.id} campana={campana} />
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
