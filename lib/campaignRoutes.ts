import { AppStep } from "@/lib/types";

export const CAMPAIGN_ROUTES = {
  form: "/brief",
  loading: "/investigacion",
  draft: "/borrador",
  gallery: "/anuncios",
} as const satisfies Record<AppStep, string>;

export const CAMPAIGN_STEPS: { key: AppStep; label: string; href: string }[] = [
  { key: "form", label: "Brief", href: CAMPAIGN_ROUTES.form },
  { key: "loading", label: "Investigación", href: CAMPAIGN_ROUTES.loading },
  { key: "draft", label: "Borrador", href: CAMPAIGN_ROUTES.draft },
  { key: "gallery", label: "Anuncios", href: CAMPAIGN_ROUTES.gallery },
];

export function stepFromPathname(pathname: string): AppStep | null {
  const entry = Object.entries(CAMPAIGN_ROUTES).find(
    ([, href]) => href === pathname
  );
  return entry ? (entry[0] as AppStep) : null;
}

export function pathForStep(step: AppStep): string {
  return CAMPAIGN_ROUTES[step];
}
