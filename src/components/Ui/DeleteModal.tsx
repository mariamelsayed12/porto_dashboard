import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  entityName?: string;
  entitySubText?: string;
  entityImage?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure you want to delete this?",
  description = "This action can’t be undone.",
  entityName,
  entitySubText,
  entityImage,
  confirmText = "Yes, delete",
  cancelText = "Cancel",
  isLoading = false,
  disabled = false,
}: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-[24px]">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0f0f14]/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Centered Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative z-10 w-full max-w-[470px] bg-[#f5f9fa] rounded-xl p-6 shadow-2xl flex flex-col gap-8 overflow-hidden"
          >
            <div className="flex flex-col gap-6 items-start w-full">
              {/* Title / Question */}
              <h3 className="w-full text-center text-[#141414] text-[19px] font-medium leading-normal whitespace-pre-wrap">
                {title}
              </h3>

              {/* Optional Entity Details Preview Card */}
              {(entityName || entitySubText || entityImage) && (
                <div className="border border-[#d4d5d8] bg-white rounded-xl p-3 w-full flex items-center gap-3">
                  {entityImage && (
                    <img
                      src={entityImage}
                      alt={entityName || "Entity preview"}
                      className="w-16 h-[61px] rounded-xl object-cover shrink-0 pointer-events-none"
                    />
                  )}
                  <div className="flex flex-col gap-1 items-start justify-center">
                    {entityName && (
                      <span className="text-[#141414] text-[19px] font-medium leading-tight">
                        {entityName}
                      </span>
                    )}
                    {entitySubText && (
                      <span className="text-[#464646] text-[16px] font-normal leading-tight">
                        {entitySubText}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Subtitle / Warning message */}
              {description && (
                <p className="text-[#464646] text-[16px] font-normal leading-normal w-full">
                  {description}
                </p>
              )}
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center gap-6 justify-end w-full">
              <Button
                type="button"
                onClick={onClose}
                disabled={disabled || isLoading}
                variant="icon"
                className="h-12 px-6 rounded-xl border border-border text-primary  transition-colors font-medium text-base text-center flex items-center justify-center !w-auto"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={onConfirm}
                disabled={disabled || isLoading}
                isLoading={isLoading}
                variant="modalPrimary"
                className="h-12 px-6 rounded-xl bg-error-red-600 hover:bg-red-700 text-white transition-colors font-medium text-base text-center flex items-center justify-center !w-auto"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
