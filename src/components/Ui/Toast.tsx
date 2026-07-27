import React from "react";
import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import { toast as hotToast, Toaster } from "react-hot-toast";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  duration?: number; // duration in ms, 0 means persist
  action?: ToastAction;
  closeButton?: boolean;
  position?: ToastPosition;
}

// ─── GLOBAL HELPER FUNCTIONS ────────────────────────────────────────────────

export function showSuccessToast(message: string, options?: ToastOptions) {
  return hotToast.custom(
    (t) => (
      <ToastItem
        id={t.id}
        visible={t.visible}
        title={message}
        variant="success"
        description={options?.description}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ),
    {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "top-center",
    }
  );
}

export function showErrorToast(message: string, options?: ToastOptions) {
  return hotToast.custom(
    (t) => (
      <ToastItem
        id={t.id}
        visible={t.visible}
        title={message}
        variant="error"
        description={options?.description}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ),
    {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "top-center",
    }
  );
}

export function showWarningToast(message: string, options?: ToastOptions) {
  return hotToast.custom(
    (t) => (
      <ToastItem
        id={t.id}
        visible={t.visible}
        title={message}
        variant="warning"
        description={options?.description}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ),
    {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "top-center",
    }
  );
}

export function showInfoToast(message: string, options?: ToastOptions) {
  return hotToast.custom(
    (t) => (
      <ToastItem
        id={t.id}
        visible={t.visible}
        title={message}
        variant="info"
        description={options?.description}
        action={options?.action}
        closeButton={options?.closeButton}
      />
    ),
    {
      duration: options?.duration ?? 4000,
      position: options?.position ?? "top-center",
    }
  );
}

// ─── ICONS & BACKGROUND SHAPES ──────────────────────────────────────────────

const BlobBackground = ({ color }: { color: string }) => (
  <svg
    className="absolute inset-0 w-full h-full"
    viewBox="0 0 60 45"
    fill="none"
    preserveAspectRatio="none"
  >
    <path
      d="M59.9995 29.9282C59.9995 38.4871 47.0293 30.7085 41.2558 36.1632C35.8796 41.2426 20.6309 44.3579 20.6309 44.3579C20.6309 44.3579 0 46.4571 0 29.9282C0 13.3993 13.4313 0 29.9997 0C46.5681 0 59.9995 13.3993 59.9995 29.9282Z"
      fill={color}
    />
  </svg>
);

const SuccessIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.142 7.983L8.875 12.25L7.42 10.796M10 1C5.029 1 1 5.029 1 10C1 14.971 5.029 19 10 19C14.971 19 19 14.971 19 10C19 5.029 14.971 1 10 1Z"
      stroke="#44992E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 6V10M10 14H10.01M10 1C5.029 1 1 5.029 1 10C1 14.971 5.029 19 10 19C14.971 19 19 14.971 19 10C19 5.029 14.971 1 10 1Z"
      stroke="#D7110E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 6V10M10 14H10.01M10 1C5.029 1 1 5.029 1 10C1 14.971 5.029 19 10 19C14.971 19 19 14.971 19 10C19 5.029 14.971 1 10 1Z"
      stroke="#D97706"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 14V10M10 6H10.01M10 1C5.029 1 1 5.029 1 10C1 14.971 5.029 19 10 19C14.971 19 19 14.971 19 10C19 5.029 14.971 1 10 1Z"
      stroke="#1E8CAB"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const variantStyles = {
  success: {
    blobColor: "#EDF6EB",
    Icon: SuccessIcon,
  },
  error: {
    blobColor: "#FDE7E7",
    Icon: ErrorIcon,
  },
  warning: {
    blobColor: "#FFF5E6",
    Icon: WarningIcon,
  },
  info: {
    blobColor: "#E9F4F7",
    Icon: InfoIcon,
  },
};

// ─── TOAST ITEM COMPONENT ───────────────────────────────────────────────────

interface ToastItemProps {
  id: string;
  visible: boolean;
  title: string;
  description?: string;
  variant: ToastVariant;
  action?: ToastAction;
  closeButton?: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({
  id,
  visible,
  title,
  description,
  variant,
  action,
  closeButton,
}) => {
  const config = variantStyles[variant];

  return (
    <motion.div
      layout
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
      aria-atomic="true"
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -15, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-[#464646] text-[#d4d5d8] border border-[#555] shadow-2xl rounded-[12px] p-[16px] flex items-center justify-between w-full max-w-[462px] min-h-[80px] pointer-events-auto"
    >
      <div className="flex gap-[16px] items-center flex-1">
        {/* Blob and Icon */}
        <div className="h-[48px] w-[60px] relative shrink-0 overflow-hidden rounded-[12px]">
          <BlobBackground color={config.blobColor} />
          <div className="absolute inset-0 flex items-center justify-center">
            <config.Icon />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col flex-1 min-w-0 pr-2">
          <p className="font-poppins font-medium text-[16px] text-[#D4D5D8] leading-snug break-words">
            {title}
          </p>
          {description && (
            <p className="font-poppins font-normal text-[14px] text-[#A3A3A3] mt-1 leading-normal break-words">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {action && (
          <button
            onClick={() => {
              action.onClick();
              hotToast.dismiss(id);
            }}
            className="text-xs font-semibold text-white px-2.5 py-1.5 rounded bg-primary hover:bg-[#156d85] transition-colors"
          >
            {action.label}
          </button>
        )}

        {closeButton !== false && (
          <button
            onClick={() => hotToast.dismiss(id)}
            className="text-[#d4d5d8] hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            aria-label="Close notification"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ─── TOAST PROVIDER CONTAINER ───────────────────────────────────────────────

export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "transparent",
          boxShadow: "none",
          border: "none",
          padding: 0,
          maxWidth: "462px",
          width: "100%",
        },
      }}
    />
  );
};
