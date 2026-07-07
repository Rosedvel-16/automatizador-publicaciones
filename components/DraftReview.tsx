"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AIDraft,
  CtaOption,
  DraftReviewInput,
  VisualStyle,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

interface DraftReviewProps {
  draft: AIDraft;
  initialReview?: DraftReviewInput | null;
  onReviewChange?: (review: DraftReviewInput) => void;
  onSubmit: (review: DraftReviewInput) => void;
  isSubmitting?: boolean;
}

const VISUAL_STYLES: VisualStyle[] = [
  "Minimalista",
  "Vibrante",
  "Profesional-corporativo",
  "Ilustrado",
];

const CTA_OPTIONS: CtaOption[] = [
  "Comprar ahora",
  "Más información",
  "Registrarte",
  "Enviar mensaje",
  "Descargar",
  "Que decida la IA",
];

export function DraftReview({
  draft,
  initialReview,
  onReviewChange,
  onSubmit,
  isSubmitting = false,
}: DraftReviewProps) {
  const [avatarCliente, setAvatarCliente] = useState(
    initialReview?.avatar_cliente ?? draft.avatar_cliente
  );
  const [dolorPrincipal, setDolorPrincipal] = useState(
    initialReview?.dolor_principal ?? draft.dolor_principal
  );
  const [transformacion, setTransformacion] = useState(
    initialReview?.transformacion_prometida ?? draft.transformacion_prometida
  );
  const [objeciones, setObjeciones] = useState(
    initialReview?.objeciones_comunes ?? draft.objeciones_comunes
  );
  const [temaBusqueda, setTemaBusqueda] = useState(
    initialReview?.tema_busqueda ?? draft.tema_busqueda
  );
  const [estiloVisual, setEstiloVisual] = useState<VisualStyle>(
    initialReview?.estilo_visual ?? "Profesional-corporativo"
  );
  const [ctaPreferido, setCtaPreferido] = useState<CtaOption>(
    initialReview?.cta_preferido ?? "Que decida la IA"
  );

  useEffect(() => {
    if (!onReviewChange) return;

    const timer = window.setTimeout(() => {
      onReviewChange({
        avatar_cliente: avatarCliente,
        dolor_principal: dolorPrincipal,
        transformacion_prometida: transformacion,
        objeciones_comunes: objeciones,
        tema_busqueda: temaBusqueda,
        estilo_visual: estiloVisual,
        cta_preferido: ctaPreferido,
      });
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    avatarCliente,
    dolorPrincipal,
    transformacion,
    objeciones,
    temaBusqueda,
    estiloVisual,
    ctaPreferido,
    onReviewChange,
  ]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      avatar_cliente: avatarCliente,
      dolor_principal: dolorPrincipal,
      transformacion_prometida: transformacion,
      objeciones_comunes: objeciones,
      tema_busqueda: temaBusqueda,
      estilo_visual: estiloVisual,
      cta_preferido: ctaPreferido,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 animate-slide-up"
    >
      <div>
        <h2 className="text-xl font-bold text-brand-white mb-1">
          Revisa el borrador
        </h2>
        <p className="text-sm text-neutral-500">
          Campos generados por IA — edítalos antes de crear los anuncios
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Textarea
          label="Avatar del cliente ideal"
          badge="Generado por IA"
          value={avatarCliente}
          onChange={(e) => setAvatarCliente(e.target.value)}
          rows={4}
        />

        <Textarea
          label="Dolor principal"
          badge="Generado por IA"
          value={dolorPrincipal}
          onChange={(e) => setDolorPrincipal(e.target.value)}
          rows={4}
        />

        <Textarea
          label="Transformación prometida"
          badge="Generado por IA"
          value={transformacion}
          onChange={(e) => setTransformacion(e.target.value)}
          rows={4}
        />

        <Textarea
          label="Objeciones comunes"
          badge="Generado por IA"
          value={objeciones}
          onChange={(e) => setObjeciones(e.target.value)}
          rows={3}
        />

        <Input
          label="Tema de búsqueda"
          badge="Generado por IA"
          value={temaBusqueda}
          onChange={(e) => setTemaBusqueda(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-800">
        <Select
          label="Estilo visual"
          value={estiloVisual}
          onChange={(e) => setEstiloVisual(e.target.value as VisualStyle)}
          options={VISUAL_STYLES.map((s) => ({ value: s, label: s }))}
        />

        <Select
          label="CTA preferido"
          value={ctaPreferido}
          onChange={(e) => setCtaPreferido(e.target.value as CtaOption)}
          options={CTA_OPTIONS.map((c) => ({ value: c, label: c }))}
        />
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Generando anuncios..." : "Generar anuncios"}
      </Button>
    </form>
  );
}
