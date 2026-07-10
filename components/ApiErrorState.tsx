"use client";

import { AlertCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ApiErrorStateProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
  backLabel?: string;
  isRetrying?: boolean;
  tone?: "error" | "warning";
  title?: string;
}

export function ApiErrorState({
  message,
  onRetry,
  onBack,
  backLabel = "Volver a editar",
  isRetrying = false,
  tone = "error",
  title,
}: ApiErrorStateProps) {
  const isWarning = tone === "warning";
  const heading = title ?? (isWarning ? "Configuración requerida" : "Algo salió mal");
  const Icon = isWarning ? AlertTriangle : AlertCircle;

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Icon
            className={[
              "w-8 h-8",
              isWarning ? "text-amber-400" : "text-red-400",
            ].join(" ")}
            strokeWidth={1.5}
          />
        </div>
        <h2 className="text-xl font-bold text-brand-white mb-2">{heading}</h2>
        <p
          className={[
            "text-sm mb-8",
            isWarning ? "text-amber-100/80" : "text-neutral-400",
          ].join(" ")}
        >
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button type="button" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? "Reintentando..." : "Reintentar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={isRetrying}
          >
            {backLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
