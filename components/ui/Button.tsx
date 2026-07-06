import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-yellow text-brand-black border-brand-yellow hover:bg-brand-yellow/90 focus-visible:ring-brand-yellow",
  secondary:
    "bg-transparent text-brand-white border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900 focus-visible:ring-neutral-500",
  ghost:
    "bg-transparent text-neutral-400 border-transparent hover:text-brand-white hover:bg-neutral-900 focus-visible:ring-neutral-500",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      fullWidth = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={[
          "inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold",
          "border transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          variantStyles[variant],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
