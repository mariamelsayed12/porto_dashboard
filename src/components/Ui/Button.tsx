import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

// CVA configurations for button design system
const buttonVariants = cva(
  "shrink-0 justify-center items-center gap-2 rounded-md font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] whitespace-nowrap",
  {
    variants: {
      variant: {
        login: "flex h-[48px] px-6 py-2 w-full bg-primary text-white hover:bg-[#156d85]",
        create: "inline-flex h-[36px] px-4 py-2 bg-primary text-white hover:bg-[#156d85]",
        viewDetails: "flex h-[36px] px-4 py-2 flex-1 border border-text-naturalGray text-text-naturalGray hover:bg-slate-50 hover:text-text-secondary",
        outlinePrimary: "flex h-[36px] px-[16px] py-[8px] gap-[8px] border border-[#747474] text-[#1e8cab] text-[16px] font-medium rounded-[12px] hover:bg-slate-50 flex-1 justify-center",
        modalPrimary: "flex h-[48px] px-6 py-2 bg-primary text-white hover:bg-[#156d85]",
        icon: "flex h-[48px] w-[48px] p-2 hover:bg-light-gray text-text-darker hover:text-text-secondary active:scale-95",
      },
    },
    defaultVariants: {
      variant: "create",
    },
  }
);

// Loading spinner component
const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5 text-current shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = disabled || isLoading;

    return (
      <button
        type={type}
        ref={ref}
        disabled={isButtonDisabled}
        className={`${buttonVariants({ variant })} ${className}`.trim()}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner />}

        {/* Left Icon (only if not loading, to avoid layout shift) */}
        {!isLoading && leftIcon && (
          <span className="flex items-center justify-center shrink-0">
            {leftIcon}
          </span>
        )}

        {/* Button Content */}
        {children}

        {/* Right Icon */}
        {!isLoading && rightIcon && (
          <span className="flex items-center justify-center shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
export { buttonVariants };
