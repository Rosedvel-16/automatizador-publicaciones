import {
  AdFormat,
  AdVariant,
  AIDraft,
  BriefInput,
  DraftReviewInput,
  GenerateVariantsRequest,
} from "./types";
import { AD_FORMAT_DIMENSIONS } from "./types";

/** Simula latencia de red / procesamiento IA */
function simulateDelay(minMs = 1500, maxMs = 3000): Promise<void> {
  const delay = minMs + Math.random() * (maxMs - minMs);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * TODO: Reemplazar por fetch() real al webhook de n8n.
 *
 * Endpoint esperado: POST ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/investigate
 * Body: BriefInput
 * Response: AIDraft
 */
export async function investigateMarket(brief: BriefInput): Promise<AIDraft> {
  await simulateDelay();

  const { nombre_producto, tipo_producto, pais_mercado, precio } = brief;

  return {
    avatar_cliente: `Profesionales de 28-45 años en ${pais_mercado} que buscan escalar sus ingresos con ${tipo_producto.toLowerCase()}s digitales. Tienen experiencia en su área pero sienten que les falta un sistema claro para monetizar su conocimiento. Ingresos entre $800 y $3,000 USD mensuales, activos en Instagram y Facebook, dispuestos a invertir en formación si ven resultados concretos.`,

    dolor_principal: `Sienten que tienen conocimiento valioso pero no saben cómo empaquetarlo ni venderlo de forma consistente. Han probado contenido gratuito y cursos genéricos sin ver retorno real. La frustración principal: invertir tiempo creando contenido que no convierte en ventas, mientras ven a otros infoproductores facturar con "${nombre_producto}" y productos similares.`,

    transformacion_prometida: `Con "${nombre_producto}" pasarán de la incertidumbre y los ingresos irregulares a un sistema replicable que genera ventas predecibles. En 30-60 días tendrán claridad sobre su oferta, un embudo funcional y las primeras conversiones — sin depender de algoritmos impredecibles ni de vender barato por desesperación.`,

    objeciones_comunes: `"Ya compré otros ${tipo_producto.toLowerCase()}s y no funcionaron" · "No tengo tiempo para implementar" · "¿Funcionará en mi nicho?" · "El precio de $${precio} es alto para mí ahora" · "Necesito ver resultados antes de invertir más"`,

    tema_busqueda: `${tipo_producto.toLowerCase()} ${nombre_producto.toLowerCase()} ${pais_mercado.toLowerCase()} marketing digital`,
  };
}

/**
 * TODO: Reemplazar por fetch() real al webhook de n8n.
 *
 * Endpoint esperado: POST ${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/generate-ads
 * Body: GenerateVariantsRequest
 * Response: AdVariant[]
 *
 * El backend real usará Gemini para copy y Nano Banana Pro para imágenes.
 */
export async function generateAdVariants(
  request: GenerateVariantsRequest
): Promise<AdVariant[]> {
  await simulateDelay();

  const {
    nombre_producto,
    tipo_producto,
    precio,
    pais_mercado,
    formato_anuncio,
    dolor_principal,
    transformacion_prometida,
    cta_preferido,
    estilo_visual,
  } = request;

  const { width, height } = AD_FORMAT_DIMENSIONS[formato_anuncio];

  const ctaPool =
    cta_preferido === "Que decida la IA"
      ? ["Comprar ahora", "Más información", "Registrarte", "Descargar"]
      : [cta_preferido];

  const variants: Omit<AdVariant, "id" | "imageUrl">[] = [
    {
      titulo: `Deja de perder ventas con ${tipo_producto.toLowerCase()}s genéricos`,
      copy_principal: `Si estás en ${pais_mercado} y tu conocimiento no se traduce en ingresos, "${nombre_producto}" te da el sistema que otros infoproductores ya usan. Metodología PAS probada en Meta Ads.`,
      cta: ctaPool[0] ?? "Comprar ahora",
    },
    {
      titulo: `De la frustración al primer ingreso en 30 días`,
      copy_principal: transformacion_prometida.slice(0, 180) + "...",
      cta: ctaPool[1 % ctaPool.length] ?? "Más información",
    },
    {
      titulo: `"${nombre_producto}" — ${tipo_producto} para quienes ya intentaron todo`,
      copy_principal: dolor_principal.slice(0, 160) + "... Inversión única de $" + precio + ".",
      cta: ctaPool[2 % ctaPool.length] ?? "Registrarte",
    },
    {
      titulo: `El ${tipo_producto.toLowerCase()} que convierte en ${pais_mercado}`,
      copy_principal: `Estilo ${estilo_visual.toLowerCase()}. Copy optimizado con AIDA para audiencias frías en Facebook e Instagram. Resultados medibles desde la primera campaña.`,
      cta: ctaPool[3 % ctaPool.length] ?? "Comprar ahora",
    },
    {
      titulo: `Tu conocimiento vale más de $${precio}`,
      copy_principal: `Supera las objeciones más comunes de tu audiencia con un anuncio diseñado para scroll-stopping. "${nombre_producto}" resuelve el problema que tu competencia ignora.`,
      cta: ctaPool[0] ?? "Comprar ahora",
    },
  ];

  const count = 3 + Math.floor(Math.random() * 3);

  return variants.slice(0, count).map((variant, index) => ({
    ...variant,
    id: `variant-${Date.now()}-${index}`,
    imageUrl: `https://placehold.co/${width}x${height}/0A0A0A/FFC700/png?text=Preview+${index + 1}`,
  }));
}

/**
 * TODO: Reemplazar por fetch() real si el backend expone regeneración como endpoint separado.
 * Por ahora reutiliza generateAdVariants con los mismos parámetros.
 */
export async function regenerateAdVariants(
  request: GenerateVariantsRequest
): Promise<AdVariant[]> {
  return generateAdVariants(request);
}

export type { DraftReviewInput, GenerateVariantsRequest };
