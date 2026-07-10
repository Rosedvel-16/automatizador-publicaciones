import {
  AdVariant,
  AIDraft,
  BriefInput,
  Campana,
  DraftReviewInput,
  GenerateVariantsRequest,
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
  debugLog("generateAdVariants → payload", request);

  const res = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
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
  varianteId: string,
  campanaId: string
): Promise<SelectVariantResponse> {
  const url = buildWebhookUrl("/seleccionar-variante");
  const payload = { variante_id: varianteId, campana_id: campanaId };
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
  success: boolean;
  message: string;
}

function validatePublishToMetaResponse(data: unknown): PublishToMetaResponse {
  if (!data || typeof data !== "object") {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado al publicar en Meta."
    );
  }

  const record = data as Record<string, unknown>;

  if (typeof record.success !== "boolean" || !isNonEmptyString(record.message)) {
    throw new Error(
      "La respuesta del servidor no tiene el formato esperado al publicar en Meta."
    );
  }

  return {
    success: record.success,
    message: record.message,
  };
}

export async function publishToMeta(
  campanaId: string,
  varianteId: string
): Promise<PublishToMetaResponse> {
  const url = buildWebhookUrl("/publicar-en-meta");
  const payload = { campana_id: campanaId, variante_id: varianteId };
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
];

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
    };
  });
}

export async function listarCampanas(): Promise<Campana[]> {
  const url = buildWebhookUrl("/listar-campanas");
  debugLog("listarCampanas → request", { method: "GET" });

  const res = await fetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("No se pudieron cargar las campañas");
  }

  const raw = await res.json();
  debugLog("listarCampanas ← response", raw);

  return validateCampanas(raw);
}

export type { DraftReviewInput, GenerateVariantsRequest };
