import {
  AdVariant,
  AIDraft,
  BriefInput,
  DraftReviewInput,
  GenerateVariantsRequest,
} from "./types";

const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL!;

export async function investigateMarket(brief: BriefInput): Promise<AIDraft> {
  const res = await fetch(`${N8N_BASE_URL}/investigar-brief`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(brief),
  });

  if (!res.ok) {
    throw new Error(`Error investigando el brief: ${res.status}`);
  }

  return res.json();
}

export async function generateAdVariants(
  request: GenerateVariantsRequest
): Promise<AdVariant[]> {
  const res = await fetch(`${N8N_BASE_URL}/generar-anuncios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Error generando anuncios: ${res.status}`);
  }

  return res.json();
}

export async function regenerateAdVariants(
  request: GenerateVariantsRequest
): Promise<AdVariant[]> {
  return generateAdVariants(request);
}

export type { DraftReviewInput, GenerateVariantsRequest };
