export type ProductType = "Curso" | "Ebook" | "Podcast";

export type MarketCountry =
  | "Perú"
  | "México"
  | "Colombia"
  | "Chile"
  | "Argentina"
  | "España";

export type AdFormat = "1:1" | "9:16" | "1.91:1";

export type VisualStyle =
  | "Minimalista"
  | "Vibrante"
  | "Profesional-corporativo"
  | "Ilustrado";

export type CtaOption =
  | "Comprar ahora"
  | "Más información"
  | "Registrarte"
  | "Enviar mensaje"
  | "Descargar"
  | "Que decida la IA";

export type AppStep = "form" | "loading" | "draft" | "gallery";

export interface BriefInput {
  nombre_producto: string;
  tipo_producto: ProductType;
  precio: number;
  link_venta: string;
  pais_mercado: MarketCountry;
  formato_anuncio: AdFormat;
  num_variantes: number;
}

export const MIN_NUM_VARIANTES = 2;
export const MAX_NUM_VARIANTES = 8;
export const DEFAULT_NUM_VARIANTES = 4;

export interface AIDraft {
  campana_id: string;
  avatar_cliente: string;
  dolor_principal: string;
  transformacion_prometida: string;
  objeciones_comunes: string;
  tema_busqueda: string;
}

export interface DraftReviewInput extends AIDraft {
  estilo_visual: VisualStyle;
  cta_preferido: CtaOption;
}

export interface AdVariant {
  id: string;
  titulo: string;
  copy_principal: string;
  cta: string;
  imageUrl: string;
}

export interface GenerateVariantsRequest extends BriefInput, DraftReviewInput {}

export type CampanaObjetivo =
  | "difusion"
  | "interaccion"
  | "trafico"
  | "conversion";

export interface PublicarCampanaInput {
  campana_id: string;
  variante_ids: string[];
  presupuesto_total: number;
  objetivo: CampanaObjetivo;
}

export const DEFAULT_CAMPANA_OBJETIVO: CampanaObjetivo = "trafico";

export const MIN_SELECTED_VARIANTS = 1;
export const MAX_SELECTED_VARIANTS = 4;
export const BUDGET_PER_VARIANT_SOLES = 20;

export interface Campana {
  id: string;
  avatar_cliente: string;
  dolor_principal: string;
  transformacion_prometida: string;
  objeciones_comunes: string;
  tema_busqueda: string;
  status: string;
  created_at: string;
  meta_campaign_id: string | null;
  meta_adset_id: string | null;
  meta_ad_id: string | null;
  published_at: string | null;
  variante_seleccionada_id: string | null;
  variante_titulo: string | null;
  variante_image_url: string | null;
}

export const AD_FORMAT_LABELS: Record<AdFormat, string> = {
  "1:1": "Feed cuadrado (1:1)",
  "9:16": "Story vertical (9:16)",
  "1.91:1": "Feed horizontal (1.91:1)",
};

export const AD_FORMAT_DIMENSIONS: Record<
  AdFormat,
  { width: number; height: number }
> = {
  "1:1": { width: 600, height: 600 },
  "9:16": { width: 540, height: 960 },
  "1.91:1": { width: 1200, height: 628 },
};

export const LOADING_STEPS = [
  "Investigando tendencias del mercado...",
  "Analizando el dolor de tu audiencia...",
  "Redactando estrategia de copy...",
] as const;
