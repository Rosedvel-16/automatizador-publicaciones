"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ApiErrorStateProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
  backLabel?: string;
  isRetrying?: boolean;
}

export function ApiErrorState({
  message,
  onRetry,
  onBack,
  backLabel = "Volver a editar",
  isRetrying = false,
}: ApiErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-bold text-brand-white mb-2">
          Algo salió mal
        </h2>
        <p className="text-sm text-neutral-400 mb-8">{message}</p>
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
