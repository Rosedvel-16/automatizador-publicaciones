"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { LOADING_STEPS } from "@/lib/types";

const ROTATION_MIN_MS = 8_000;
const ROTATION_MAX_MS = 10_000;

interface LoadingStepsProps {
  onComplete: () => void;
  apiDone?: boolean;
}

export function LoadingSteps({ onComplete, apiDone = false }: LoadingStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    if (apiDone) {
      setAllDone(true);
      onComplete();
    }
  }, [apiDone, onComplete]);

  useEffect(() => {
    if (allDone) return;

    const duration =
      ROTATION_MIN_MS + Math.random() * (ROTATION_MAX_MS - ROTATION_MIN_MS);

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [activeIndex, allDone]);

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold text-brand-white mb-2 text-center">
          Procesando tu brief
        </h2>
        <p className="text-sm text-neutral-500 text-center mb-10">
          La IA está investigando tu mercado y preparando el borrador
        </p>

        <ul className="flex flex-col gap-4" role="list">
          {LOADING_STEPS.map((step, index) => {
            const isCompleted = allDone;
            const isActive = !allDone && index === activeIndex;
            const isPending = !allDone && index !== activeIndex;

            return (
              <li
                key={step}
                className={[
                  "flex items-center gap-4 px-4 py-3 border transition-all duration-500",
                  isCompleted
                    ? "border-brand-yellow/30 bg-brand-yellow/5"
                    : isActive
                      ? "border-neutral-600 bg-neutral-900"
                      : "border-neutral-800 bg-transparent opacity-50",
                ].join(" ")}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <span
                  className={[
                    "flex items-center justify-center w-6 h-6 shrink-0",
                    isCompleted
                      ? "text-brand-yellow"
                      : isActive
                        ? "text-brand-white"
                        : "text-neutral-600",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Circle
                      className={[
                        "w-4 h-4",
                        isActive ? "animate-pulse" : "",
                      ].join(" ")}
                    />
                  )}
                </span>
                <span
                  className={[
                    "text-sm",
                    isCompleted
                      ? "text-brand-white"
                      : isPending
                        ? "text-neutral-600"
                        : "text-neutral-400",
                  ].join(" ")}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
