import React, { useState, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { FiEye, FiEyeOff } from "react-icons/fi";
import InputErrorMessage from "./InputErrorMessage";

// CVA configurations for the input design system container
const inputContainerVariants = cva(
  "flex items-center justify-between w-full rounded-sm border bg-white transition-all duration-200 focus-within:ring-1",
  {
    variants: {
      variant: {
        modal: "border-[#747474] focus-within:border-[#1E8CAB] focus-within:ring-[#1E8CAB] hover:border-[#464646]",
        login: "border-[#747474] focus-within:border-[#1E8CAB] focus-within:ring-[#1E8CAB] hover:border-[#464646]",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-12 px-3 text-base", // 48px height, 12px padding (px-3 = 12px)
        lg: "h-14 px-4 text-lg",
      },
      hasError: {
        true: "border-red-500 focus-within:border-red-500 focus-within:ring-red-500 hover:border-red-600",
        false: "",
      },
      hasSuccess: {
        true: "border-green-500 focus-within:border-green-500 focus-within:ring-green-500 hover:border-green-600",
        false: "",
      },
      disabled: {
        true: "bg-slate-50 border-gray-200 opacity-60 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "modal",
      size: "md",
      hasError: false,
      hasSuccess: false,
      disabled: false,
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<VariantProps<typeof inputContainerVariants>, "hasError" | "hasSuccess" | "disabled"> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      variant,
      size,
      label,
      helperText,
      error,
      success = false,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      containerClassName = "",
      disabled = false,
      type = "text",
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    // Determine the actual input type (for password toggle)
    const isPasswordType = type === "password";
    const currentInputType = isPasswordType && showPasswordToggle && isPasswordVisible ? "text" : type;

    // Toggle password visibility
    const handlePasswordToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsPasswordVisible((prev) => !prev);
    };

    return (
      <div className={`flex flex-col w-full gap-1.5 ${containerClassName}`.trim()}>
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-text-darker select-none">
            {label}
          </label>
        )}

        {/* Input Wrapper Container */}
        <div
          className={inputContainerVariants({
            variant,
            size,
            hasError: !!error,
            hasSuccess: success,
            disabled,
          })}
        >
          {/* Left Icon */}
          {leftIcon && (
            <span className="flex items-center justify-center text-text-naturalGray shrink-0 mr-2.5">
              {leftIcon}
            </span>
          )}

          {/* Inner Input Element */}
          <input
            ref={ref}
            type={currentInputType}
            disabled={disabled}
            className={`w-full h-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-text-secondary placeholder:text-text-naturalGray placeholder:opacity-75 disabled:cursor-not-allowed ${className}`.trim()}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          {isPasswordType && showPasswordToggle ? (
            <button
              type="button"
              onClick={handlePasswordToggle}
              disabled={disabled}
              className="flex items-center justify-center text-text-naturalGray hover:text-text-secondary focus:outline-none shrink-0 ml-2.5 disabled:opacity-50"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
          ) : rightIcon ? (
            <span className="flex items-center justify-center text-text-naturalGray shrink-0 ml-2.5">
              {rightIcon}
            </span>
          ) : null}
        </div>

        {/* Helper or Error Messages */}
        {error ? (
          <InputErrorMessage msg={error} />
        ) : helperText ? (
          <span className="text-xs text-text-naturalGray">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
