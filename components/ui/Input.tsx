import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  badge?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, badge, prefix, id, className = "", ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-brand-white"
          >
            {label}
          </label>
          {badge && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 border border-brand-yellow/30 text-brand-yellow bg-brand-yellow/5">
              {badge}
            </span>
          )}
        </div>
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full bg-neutral-900 border px-4 py-3 text-sm text-brand-white",
              "placeholder:text-neutral-500 transition-colors duration-200",
              "focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow",
              error ? "border-red-500" : "border-neutral-700",
              prefix ? "pl-8" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
