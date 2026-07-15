import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  error?: string;
  
  // New props for the Filter & Sort section
  variant?: "form" | "filter";
  singleSelect?: boolean;
  icon?: React.ReactNode;
  showChevron?: boolean;
}

export default function MultiSelectDropdown({
  label,
  placeholder = "Select options",
  options,
  value = [],
  onChange,
  required = false,
  error,
  variant = "form",
  singleSelect = false,
  icon,
  showChevron = true,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Local state for filter variant to stage selections before applying
  const [tempValue, setTempValue] = useState<string[]>(value);

  // Sync temp value with prop value when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTempValue(value);
    }
  }, [isOpen, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionValue: string) => {
    if (variant === "filter") {
      if (singleSelect) {
        setTempValue([optionValue]);
      } else {
        if (tempValue.includes(optionValue)) {
          setTempValue(tempValue.filter((val) => val !== optionValue));
        } else {
          setTempValue([...tempValue, optionValue]);
        }
      }
    } else {
      // Form variant: apply changes immediately
      if (singleSelect) {
        onChange([optionValue]);
        setIsOpen(false);
      } else {
        if (value.includes(optionValue)) {
          onChange(value.filter((val) => val !== optionValue));
        } else {
          onChange([...value, optionValue]);
        }
      }
    }
  };

  const handleApply = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  const handleReset = () => {
    onChange([]);
    setTempValue([]);
    setIsOpen(false);
  };

  // Determine display text based on selected values
  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (singleSelect || value.length === 1) {
      const selectedOption = options.find((opt) => opt.value === value[0]);
      return selectedOption ? selectedOption.label : placeholder;
    }
    return `${value.length} selected`;
  };

  const isFilterVariant = variant === "filter";

  return (
    <div ref={containerRef} className={`flex flex-col gap-2 relative ${isFilterVariant ? "w-auto" : "w-full"}`}>
      {/* Label (only for form variant) */}
      {label && !isFilterVariant && (
        <label className="text-base font-normal text-text-secondary select-none">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          isFilterVariant
            ? `flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#d4d5d8] bg-white px-4 py-2 text-base font-normal text-[#141414] hover:text-primary hover:border-primary transition-all duration-200 cursor-pointer ${
                isOpen ? "border-primary text-primary" : ""
              }`
            : `flex h-12 w-full items-center justify-between rounded-lg border bg-white px-3 text-base text-text-secondary outline-none transition-all duration-200 ${
                isOpen
                  ? "border-primary ring-1 ring-primary"
                  : error
                  ? "border-red-500 hover:border-red-600"
                  : "border-[#747474] hover:border-text-darker"
              }`
        }
      >
        <span className={!isFilterVariant && value.length === 0 ? "text-text-naturalGray" : ""}>
          {getDisplayText()}
        </span>
        {icon && <span className="shrink-0">{icon}</span>}
        {showChevron && (
          <FiChevronDown
            className={`h-6 w-6 transition-transform duration-200 ${
              isFilterVariant ? "text-current size-5" : "text-text-secondary"
            } ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-[calc(100%+4px)] z-50 overflow-y-auto bg-white border border-[#d4d5d8] shadow-lg ${
            isFilterVariant
              ? "right-0 min-w-[240px] max-h-80 rounded-[12px] p-4 flex flex-col gap-2"
              : "left-0 w-full max-h-60 rounded-lg py-1"
          }`}
        >
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-text-naturalGray text-center">
              No options available
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
              {options.map((option) => {
                const isSelected = isFilterVariant
                  ? tempValue.includes(option.value)
                  : value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggleOption(option.value)}
                    className={
                      isFilterVariant
                        ? "flex w-full items-center gap-3 px-3 py-2 text-left text-base text-[#141414] hover:bg-[#F5F9FA] rounded-[8px] transition-colors cursor-pointer"
                        : "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-[#F5F9FA] transition-colors cursor-pointer"
                    }
                  >
                    {isFilterVariant ? (
                      <>
                        {/* Left aligned Checkbox / Radio */}
                        <div
                          className={`flex h-5 w-5 items-center justify-center shrink-0 border transition-colors ${
                            singleSelect ? "rounded-full" : "rounded-[4px]"
                          } ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-[#d4d5d8]"
                          }`}
                        >
                          {isSelected && (
                            singleSelect ? (
                              <div className="h-2.5 w-2.5 rounded-full bg-white" />
                            ) : (
                              <FiCheck className="h-3.5 w-3.5" />
                            )
                          )}
                        </div>
                        <span className="font-normal">{option.label}</span>
                      </>
                    ) : (
                      <>
                        <span>{option.label}</span>
                        {/* Right aligned Checkbox */}
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-[#747474]"
                          }`}
                        >
                          {isSelected && <FiCheck className="h-3.5 w-3.5" />}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Buttons for Filter Variant */}
          {isFilterVariant && (
            <>
              <div className="h-px bg-[#EDEFF2] my-2 w-full shrink-0" />
              <div className="flex items-center justify-between gap-4 w-full shrink-0 pt-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-base font-medium text-primary hover:underline cursor-pointer bg-transparent border-none outline-none py-1"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-2 text-base font-medium bg-primary text-white rounded-[12px] hover:bg-[#156d85] transition-colors cursor-pointer border-none outline-none"
                >
                  Apply
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message (only for form variant) */}
      {error && !isFilterVariant && (
        <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
