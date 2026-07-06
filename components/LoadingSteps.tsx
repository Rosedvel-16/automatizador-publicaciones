"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { LOADING_STEPS } from "@/lib/types";

interface LoadingStepsProps {
  onComplete: () => void;
}

export function LoadingSteps({ onComplete }: LoadingStepsProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (completedCount >= LOADING_STEPS.length) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }

    const stepDuration = 1000 + Math.random() * 1000;
    const timer = setTimeout(() => {
      setCompletedCount((prev) => prev + 1);
      setActiveIndex((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [completedCount, onComplete]);

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
            const isCompleted = index < completedCount;
            const isActive =
              index === activeIndex && index >= completedCount - 1 && !isCompleted;
            const isPending = index > activeIndex && !isCompleted;

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
