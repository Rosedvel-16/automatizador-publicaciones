"use client";

import { useCallback, useState } from "react";
import {
  AdVariant,
  AIDraft,
  AppStep,
  BriefInput,
  DraftReviewInput,
} from "@/lib/types";

export const SESSION_STORAGE_KEY = "lernymart_ads_session";

export interface AdsSessionSnapshot {
  currentStep: AppStep;
  briefInput: BriefInput | null;
  aiDraft: AIDraft | null;
  draftReview: DraftReviewInput | null;
  adVariants: AdVariant[] | null;
  selectedVariantIds: string[];
  /** @deprecated Prefer selectedVariantIds — kept for restoring old sessions */
  selectedVariantId?: string | null;
  variantConfirmed?: boolean;
  metaPublished?: boolean;
}

function normalizeSelectedVariantIds(
  snapshot: Pick<AdsSessionSnapshot, "selectedVariantIds" | "selectedVariantId">
): string[] {
  if (Array.isArray(snapshot.selectedVariantIds)) {
    return snapshot.selectedVariantIds.filter(
      (id): id is string => typeof id === "string" && id.length > 0
    );
  }

  if (
    typeof snapshot.selectedVariantId === "string" &&
    snapshot.selectedVariantId.length > 0
  ) {
    return [snapshot.selectedVariantId];
  }

  return [];
}

export interface RestoredSession {
  snapshot: AdsSessionSnapshot | null;
  notice: string | null;
}

const INTERRUPTED_NOTICE =
  "Se interrumpió la carga anterior, puedes continuar";

function isValidSnapshot(value: unknown): value is AdsSessionSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as AdsSessionSnapshot;
  return (
    snapshot.currentStep === "form" ||
    snapshot.currentStep === "loading" ||
    snapshot.currentStep === "draft" ||
    snapshot.currentStep === "gallery"
  );
}

function resolveInterruptedSession(
  snapshot: AdsSessionSnapshot
): RestoredSession {
  let notice: string | null = null;
  let currentStep = snapshot.currentStep;

  if (currentStep === "loading") {
    notice = INTERRUPTED_NOTICE;
    currentStep = snapshot.aiDraft ? "draft" : "form";
  }

  const resolved: AdsSessionSnapshot = {
    ...snapshot,
    currentStep,
    selectedVariantIds: normalizeSelectedVariantIds(snapshot),
  };

  if (currentStep === "draft") {
    if (!resolved.briefInput || !resolved.aiDraft) {
      return { snapshot: null, notice: null };
    }
    return { snapshot: resolved, notice };
  }

  if (currentStep === "gallery") {
    if (!resolved.briefInput || !resolved.adVariants?.length) {
      if (resolved.briefInput && resolved.aiDraft) {
        return {
          snapshot: {
            ...resolved,
            currentStep: "draft",
            adVariants: null,
            selectedVariantIds: [],
          },
          notice:
            notice ??
            "Se restauró el borrador; vuelve a generar anuncios si es necesario.",
        };
      }
      return { snapshot: null, notice: null };
    }
    return { snapshot: resolved, notice };
  }

  if (currentStep === "form") {
    return { snapshot: resolved, notice };
  }

  return { snapshot: null, notice: null };
}

export function readAdsSession(): RestoredSession {
  if (typeof window === "undefined") {
    return { snapshot: null, notice: null };
  }

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return { snapshot: null, notice: null };
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isValidSnapshot(parsed)) {
      return { snapshot: null, notice: null };
    }

    if (parsed.currentStep === "form") {
      return { snapshot: parsed, notice: null };
    }

    return resolveInterruptedSession(parsed);
  } catch {
    return { snapshot: null, notice: null };
  }
}

export function writeAdsSession(snapshot: AdsSessionSnapshot): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignorar errores de cuota o acceso denegado
  }
}

export function clearAdsSession(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignorar
  }
}

export function useSessionPersistence() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [restoreNotice, setRestoreNotice] = useState<string | null>(null);

  const hydrateFromStorage = useCallback((): RestoredSession => {
    const restored = readAdsSession();
    setRestoreNotice(restored.notice);
    setIsHydrated(true);
    return restored;
  }, []);

  const saveSession = useCallback((snapshot: AdsSessionSnapshot) => {
    writeAdsSession(snapshot);
  }, []);

  const clearSession = useCallback(() => {
    clearAdsSession();
    setRestoreNotice(null);
  }, []);

  return {
    isHydrated,
    hydrateFromStorage,
    saveSession,
    clearSession,
    restoreNotice,
    setRestoreNotice,
  };
}
