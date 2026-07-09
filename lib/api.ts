import {
  AdVariant,
  AIDraft,
  BriefInput,
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

export type { DraftReviewInput, GenerateVariantsRequest };
