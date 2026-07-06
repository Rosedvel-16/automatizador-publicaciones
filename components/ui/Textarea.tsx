import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  badge?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, badge, id, className = "", ...props }, ref) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={textareaId}
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
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            "w-full min-h-[100px] resize-y bg-neutral-900 border px-4 py-3 text-sm text-brand-white",
            "placeholder:text-neutral-500 transition-colors duration-200 leading-relaxed",
            "focus:outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow",
            error ? "border-red-500" : "border-neutral-700",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
