import { useState, useEffect } from "react";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Input from "./Input";
import Button from "./Button";
import MultiSelectDropdown from "./MultiSelectDropdown";
import ImageUploadGrid from "./ImageUploadGrid";
import LocationPicker from "./LocationPicker";

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "select"
  | "multiselect"
  | "image-upload"
  | "location"
  | "divider";

export interface FieldConfig {
  name: string;
  label?: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[]; // for select/multiselect
  defaultValue?: any;
  helperText?: string;
}

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => void;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  globalError?: string;
}

export default function CreateModal({
  isOpen,
  onClose,
  title,
  fields,
  onSubmit,
  submitText = "Create",
  cancelText = "Cancel",
  isLoading = false,
  globalError,
}: CreateModalProps) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or initialize values when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialValues: Record<string, any> = {};
      fields.forEach((field) => {
        if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        } else {
          // Determine sensible defaults
          switch (field.type) {
            case "multiselect":
              initialValues[field.name] = [];
              break;
            case "image-upload":
              initialValues[field.name] = { cover: null, images: [null, null, null, null] };
              break;
            case "location":
              initialValues[field.name] = "";
              break;
            default:
              initialValues[field.name] = "";
          }
        }
      });
      setValues(initialValues);
      setErrors({});
    }
  }, [isOpen, fields]);

  // Handle outside click or Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleFieldChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required) {
        const val = values[field.name];
        if (field.type === "image-upload") {
          if (!val?.cover) {
            newErrors[field.name] = "Cover image is required";
          }
        } else if (field.type === "multiselect") {
          if (!val || val.length === 0) {
            newErrors[field.name] = "Please select at least one option";
          }
        } else if (field.type === "location") {
          if (!val || !val.trim()) {
            newErrors[field.name] = "Location search query is required";
          }
        } else {
          if (val === undefined || val === null || val === "") {
            newErrors[field.name] = `${field.label || field.name} is required`;
          }
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll form to top or first error (simplified here)
      return;
    }

    onSubmit(values);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0f0f14]/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sliding Panel container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
            className="relative z-10 flex h-full w-full flex-col bg-[#F5F9FA] shadow-2xl sm:max-w-[522px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#EDEFF2] bg-[#F5F9FA]">
              <h2 className="text-[23px] font-medium text-text-secondary">
                {title}
              </h2>
              <Button
                onClick={onClose}
                variant="icon"
                className="flex items-center justify-center p-2 rounded-xl text-text-darker hover:bg-[#EDEFF2] hover:text-text-secondary transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </Button>
            </div>

            {/* Scrollable Form Content */}
            <form
              onSubmit={handleFormSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5"
            >
              {globalError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <span>{globalError}</span>
                </div>
              )}

              {fields.map((field, idx) => {
                if (field.type === "divider") {
                  return (
                    <div key={`div-${idx}`} className="h-0.5 w-full bg-[#EDEFF2] my-2" />
                  );
                }

                const fieldValue = values[field.name];
                const fieldError = errors[field.name];

                return (
                  <div key={field.name} className="w-full">
                    {field.type === "multiselect" ? (
                      <MultiSelectDropdown
                        label={field.label}
                        placeholder={field.placeholder}
                        options={field.options || []}
                        value={fieldValue || []}
                        onChange={(val) => handleFieldChange(field.name, val)}
                        required={field.required}
                        error={fieldError}
                      />
                    ) : field.type === "image-upload" ? (
                      <ImageUploadGrid
                        label={field.label}
                        required={field.required}
                        value={fieldValue}
                        onChange={(val) => handleFieldChange(field.name, val)}
                        error={fieldError}
                      />
                    ) : field.type === "location" ? (
                      <LocationPicker
                        label={field.label}
                        required={field.required}
                        value={fieldValue || ""}
                        onChange={(val) => handleFieldChange(field.name, val)}
                        error={fieldError}
                      />
                    ) : (
                      <Input
                        label={field.label}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={fieldValue || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        error={fieldError}
                        helperText={field.helperText}
                        variant="modal"
                        size="md"
                      />
                    )}
                  </div>
                );
              })}
            </form>

            {/* Footer actions */}
            <div className="flex justify-end items-center gap-4 px-6 py-6 border-t border-[#EDEFF2] bg-[#F5F9FA]">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="icon"
                className="flex h-12 w-auto items-center justify-center p-2 rounded-xl text-[#1e8cab] text-base font-medium hover:bg-[#EDEFF2] transition-colors disabled:opacity-50"
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                onClick={handleFormSubmit}
                isLoading={isLoading}
                variant="modalPrimary"
                className="h-12 rounded-xl px-6 bg-[#1e8cab] hover:bg-[#156d85]"
              >
                {submitText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
