import {
  AdVariant,
  AIDraft,
  BriefInput,
  Campana,
  DEFAULT_NUM_VARIANTES,
  DraftReviewInput,
  GenerateVariantsRequest,
  MAX_NUM_VARIANTES,
  MetricasTotales,
  MIN_NUM_VARIANTES,
  PublicarCampanaInput,
  VariantePublicada,
} from "./types";

const TIMEOUT_INVESTIGATE_MS = 90_000;
const TIMEOUT_GENERATE_MS = 120_000;

const TIMEOUT_MESSAGE =
  "El servidor tardó demasiado en responder. Intenta de nuevo.";

const AI_DRAFT_KEYS: (keyof AIDraft)[] = [
  "campana_id",
  "avatar_cliente",
  "dolor_principal",
  "transformacion_prometida",
  "objeciones_comunes",
  "tema_busqueda",
];

const AD_VARIANT_KEYS: (keyof AdVariant)[] = [
  "id",
  "titulo",
  "copy_principal",
  "cta",
  "imageUrl",
];

function buildWebhookUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "").replace(
    /\/+$/,
    ""
  );
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

function debugLog(label: string, data: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[api] ${label}`, data);
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateAIDraft(data: unknown): AIDraft {
  if (!data || typeof data !== "object") {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado para el borrador."
    );
  }

  const record = data as Record<string, unknown>;

  for (const key of AI_DRAFT_KEYS) {
    if (!isNonEmptyString(record[key])) {
      throw new Error(
        `La respuesta del servidor no incluye el campo requerido: ${key}.`
      );
    }
  }

  return {
    campana_id: record.campana_id as string,
    avatar_cliente: record.avatar_cliente as string,
    dolor_principal: record.dolor_principal as string,
    transformacion_prometida: record.transformacion_prometida as string,
    objeciones_comunes: record.objeciones_comunes as string,
    tema_busqueda: record.tema_busqueda as string,
  };
}

function validateAdVariants(data: unknown): AdVariant[] {
  if (!Array.isArray(data)) {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado para los anuncios."
    );
  }

  if (data.length === 0) {
    throw new Error(
      "El servidor no devolvió ninguna variante de anuncio. Intenta de nuevo."
    );
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`La variante ${index + 1} no tiene un formato válido.`);
    }

    const record = item as Record<string, unknown>;

    for (const key of AD_VARIANT_KEYS) {
      if (!isNonEmptyString(record[key])) {
        throw new Error(
          `La variante ${index + 1} no incluye el campo requerido: ${key}.`
        );
      }
    }

    return {
      id: record.id as string,
      titulo: record.titulo as string,
      copy_principal: record.copy_principal as string,
      cta: record.cta as string,
      imageUrl: record.imageUrl as string,
    };
  });
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(TIMEOUT_MESSAGE);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function investigateMarket(brief: BriefInput): Promise<AIDraft> {
  const url = buildWebhookUrl("/investigar-brief");
  debugLog("investigateMarket → payload", brief);

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brief),
    },
    TIMEOUT_INVESTIGATE_MS
  );

  if (!res.ok) {
    throw new Error(`Error investigando el brief: ${res.status}`);
  }

  const raw = await res.json();
  debugLog("investigateMarket ← response", raw);

  return validateAIDraft(raw);
}

export async function generateAdVariants(
  request: GenerateVariantsRequest
): Promise<AdVariant[]> {
  const url = buildWebhookUrl("/generar-anuncios");
  const numVariantes =
    typeof request.num_variantes === "number" &&
    request.num_variantes >= MIN_NUM_VARIANTES &&
    request.num_variantes <= MAX_NUM_VARIANTES
      ? request.num_variantes
      : DEFAULT_NUM_VARIANTES;

  const payload = {
    ...request,
    num_variantes: numVariantes,
  };
  debugLog("generateAdVariants → payload", payload);

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    TIMEOUT_GENERATE_MS
  );

  if (!res.ok) {
    throw new Error(`Error generando anuncios: ${res.status}`);
  }

  const raw = await res.json();
  debugLog("generateAdVariants ← response", raw);

  return validateAdVariants(raw);
}

export async function regenerateAdVariants(
  request: GenerateVariantsRequest
): Promise<AdVariant[]> {
  return generateAdVariants(request);
}

export interface SelectVariantResponse {
  success: boolean;
  message: string;
}

function validateSelectVariantResponse(data: unknown): SelectVariantResponse {
  if (!data || typeof data !== "object") {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado al seleccionar la variante."
    );
  }

  const record = data as Record<string, unknown>;

  if (typeof record.success !== "boolean" || !isNonEmptyString(record.message)) {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado al seleccionar la variante."
    );
  }

  return {
    success: record.success,
    message: record.message,
  };
}

export async function selectVariant(
  varianteIds: string[],
  campanaId: string
): Promise<SelectVariantResponse> {
  const url = buildWebhookUrl("/seleccionar-variante");
  const payload = { variante_ids: varianteIds, campana_id: campanaId };
  debugLog("selectVariant → payload", payload);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Error al seleccionar la variante: ${res.status}`);
  }

  const raw = await res.json();
  debugLog("selectVariant ← response", raw);

  return validateSelectVariantResponse(raw);
}

const TIMEOUT_PUBLISH_META_MS = 60_000;

const PUBLISH_META_TIMEOUT_MESSAGE =
  "La publicación en Meta tardó demasiado. Verifica en Meta Ads Manager si se creó parcialmente.";

export interface PublishToMetaResponse {
  meta_campaign_id: string;
  meta_adset_id?: string | null;
  meta_ad_id?: string | null;
}

function validatePublishToMetaResponse(data: unknown): PublishToMetaResponse {
  if (!data || typeof data !== "object") {
    console.error("[api] publishToMeta — respuesta inválida:", data);
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado al publicar en Meta."
    );
  }

  const record = data as Record<string, unknown>;

  if (record.success === false) {
    console.error("[api] publishToMeta — success:false en la respuesta:", data);
    const errorMessage =
      typeof record.error === "string" && record.error.trim()
        ? record.error
        : "No se pudo publicar la campaña en Meta Ads";
    throw new Error(errorMessage);
  }

  if (typeof record.error === "string" && record.error.trim()) {
    console.error("[api] publishToMeta — error en la respuesta:", data);
    throw new Error(record.error);
  }

  const { meta_campaign_id } = record;

  if (!isNonEmptyString(meta_campaign_id)) {
    console.error(
      "[api] publishToMeta — falta meta_campaign_id en la respuesta:",
      data
    );
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado al publicar en Meta."
    );
  }

  return {
    meta_campaign_id,
    meta_adset_id:
      typeof record.meta_adset_id === "string" ? record.meta_adset_id : null,
    meta_ad_id:
      typeof record.meta_ad_id === "string" ? record.meta_ad_id : null,
  };
}

export async function publishToMeta(
  input: PublicarCampanaInput
): Promise<PublishToMetaResponse> {
  const url = buildWebhookUrl("/publicar-en-meta");
  const payload = {
    campana_id: input.campana_id,
    variante_ids: input.variante_ids,
    presupuesto_total: input.presupuesto_total,
    objetivo: input.objetivo,
  };
  debugLog("publishToMeta → payload", payload);

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    TIMEOUT_PUBLISH_META_MS
  );

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data: unknown = await res.json().catch(() => null);
    debugLog("publishToMeta ← response", data);

    if (!res.ok) {
      const record =
        data && typeof data === "object"
          ? (data as Record<string, unknown>)
          : null;
      const specificError =
        typeof record?.error === "string" && record.error.trim()
          ? record.error
          : null;
      console.error("[api] publishToMeta — error HTTP:", {
        status: res.status,
        body: data,
      });
      throw new Error(specificError || `Error al publicar en Meta: ${res.status}`);
    }

    return validatePublishToMetaResponse(data);
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === "AbortError") ||
      (error instanceof Error && error.name === "AbortError")
    ) {
      throw new Error(PUBLISH_META_TIMEOUT_MESSAGE);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const CAMPANA_KEYS: (keyof Campana)[] = [
  "id",
  "avatar_cliente",
  "dolor_principal",
  "transformacion_prometida",
  "objeciones_comunes",
  "tema_busqueda",
  "status",
  "created_at",
  "meta_campaign_id",
  "meta_adset_id",
  "meta_ad_id",
  "published_at",
  "variante_seleccionada_id",
  "variante_titulo",
  "variante_image_url",
];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseMetricasTotales(
  value: unknown,
  campanaIndex: number
): MetricasTotales | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object") {
    throw new Error(
      `La campaña ${campanaIndex + 1} tiene un valor inválido en metricas_totales.`
    );
  }

  const record = value as Record<string, unknown>;
  const keys = ["impresiones", "clics", "gasto", "ctr"] as const;

  for (const key of keys) {
    if (!isFiniteNumber(record[key])) {
      throw new Error(
        `La campaña ${campanaIndex + 1} tiene un valor inválido en metricas_totales.${key}.`
      );
    }
  }

  return {
    impresiones: record.impresiones as number,
    clics: record.clics as number,
    gasto: record.gasto as number,
    ctr: record.ctr as number,
  };
}

function parseVariantesPublicadas(
  value: unknown,
  campanaIndex: number
): VariantePublicada[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error(
      `La campaña ${campanaIndex + 1} tiene un valor inválido en variantes_publicadas.`
    );
  }

  return value.map((item, variantIndex) => {
    if (!item || typeof item !== "object") {
      throw new Error(
        `La campaña ${campanaIndex + 1} tiene una variante publicada inválida (#${variantIndex + 1}).`
      );
    }

    const record = item as Record<string, unknown>;

    if (!isNonEmptyString(record.id) || !isNonEmptyString(record.titulo)) {
      throw new Error(
        `La campaña ${campanaIndex + 1} tiene una variante publicada incompleta (#${variantIndex + 1}).`
      );
    }

    if (
      !isFiniteNumber(record.impresiones) ||
      !isFiniteNumber(record.clics) ||
      !isFiniteNumber(record.gasto)
    ) {
      throw new Error(
        `La campaña ${campanaIndex + 1} tiene métricas inválidas en la variante #${variantIndex + 1}.`
      );
    }

    return {
      id: record.id,
      titulo: record.titulo,
      image_url: isNonEmptyString(record.image_url) ? record.image_url : "",
      impresiones: record.impresiones,
      clics: record.clics,
      gasto: record.gasto,
    };
  });
}

function validateCampanas(data: unknown): Campana[] {
  if (!Array.isArray(data)) {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado para las campañas."
    );
  }

  return data.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`La campaña ${index + 1} no tiene un formato válido.`);
    }

    const record = item as Record<string, unknown>;

    for (const key of CAMPANA_KEYS) {
      if (!(key in record)) {
        throw new Error(
          `La campaña ${index + 1} no incluye el campo requerido: ${key}.`
        );
      }
    }

    const nullableStringKeys = [
      "meta_campaign_id",
      "meta_adset_id",
      "meta_ad_id",
      "published_at",
      "variante_seleccionada_id",
      "variante_titulo",
      "variante_image_url",
    ] as const;

    for (const key of nullableStringKeys) {
      const value = record[key];
      if (value !== null && typeof value !== "string") {
        throw new Error(
          `La campaña ${index + 1} tiene un valor inválido en ${key}.`
        );
      }
    }

    const requiredStringKeys = CAMPANA_KEYS.filter(
      (key) => !nullableStringKeys.includes(key as (typeof nullableStringKeys)[number])
    );

    for (const key of requiredStringKeys) {
      if (!isNonEmptyString(record[key])) {
        throw new Error(
          `La campaña ${index + 1} no incluye el campo requerido: ${key}.`
        );
      }
    }

    return {
      id: record.id as string,
      avatar_cliente: record.avatar_cliente as string,
      dolor_principal: record.dolor_principal as string,
      transformacion_prometida: record.transformacion_prometida as string,
      objeciones_comunes: record.objeciones_comunes as string,
      tema_busqueda: record.tema_busqueda as string,
      status: record.status as string,
      created_at: record.created_at as string,
      meta_campaign_id: record.meta_campaign_id as string | null,
      meta_adset_id: record.meta_adset_id as string | null,
      meta_ad_id: record.meta_ad_id as string | null,
      published_at: record.published_at as string | null,
      variante_seleccionada_id: record.variante_seleccionada_id as string | null,
      variante_titulo: record.variante_titulo as string | null,
      variante_image_url: record.variante_image_url as string | null,
      metricas_totales: parseMetricasTotales(record.metricas_totales, index),
      variantes_publicadas: parseVariantesPublicadas(
        record.variantes_publicadas,
        index
      ),
    };
  });
}

export async function listarCampanas(): Promise<Campana[]> {
  const url = buildWebhookUrl("/listar-campanas");
  debugLog("listarCampanas → request", { method: "GET", url });

  const res = await fetch(url, {
    method: "GET",
  });

  const rawText = await res.text();
  debugLog("listarCampanas ← raw", {
    status: res.status,
    bodyPreview: rawText.slice(0, 300),
  });

  if (!res.ok) {
    throw new Error(
      `No se pudieron cargar las campañas (${res.status}). Verifica el webhook /listar-campanas en n8n.`
    );
  }

  if (!rawText.trim()) {
    throw new Error(
      "El webhook /listar-campanas respondió vacío. Activa el workflow en n8n y asegúrate de que use 'Respond to Webhook' con un JSON array."
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawText);
  } catch {
    throw new Error(
      "El webhook /listar-campanas no devolvió JSON válido. Revisa la respuesta del nodo en n8n."
    );
  }

  debugLog("listarCampanas ← response", raw);

  return validateCampanas(raw);
}

export type { DraftReviewInput, GenerateVariantsRequest, PublicarCampanaInput };
