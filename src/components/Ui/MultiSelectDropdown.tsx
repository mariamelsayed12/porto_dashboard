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
}

export default function MultiSelectDropdown({
  label,
  placeholder = "Select options",
  options,
  value = [],
  onChange,
  required = false,
  error,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    if (value.includes(optionValue)) {
      onChange(value.filter((val) => val !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const displayText =
    value.length > 0
      ? `${value.length} selected`
      : placeholder;

  return (
    <div ref={containerRef} className="flex flex-col w-full gap-2 relative">
      {/* Label */}
      {label && (
        <label className="text-base font-normal text-text-secondary select-none">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-12 w-full items-center justify-between rounded-lg border bg-white px-3 text-base text-text-secondary outline-none transition-all duration-200 ${
          isOpen
            ? "border-primary ring-1 ring-primary"
            : error
            ? "border-red-500 hover:border-red-600"
            : "border-[#747474] hover:border-text-darker"
        }`}
      >
        <span className={value.length > 0 ? "text-text-secondary" : "text-text-naturalGray"}>
          {displayText}
        </span>
        <FiChevronDown
          className={`h-6 w-6 text-text-secondary transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] z-50 w-full max-h-60 overflow-y-auto rounded-lg border border-border bg-white py-1 shadow-lg">
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-text-naturalGray text-center">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggleOption(option.value)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-text-secondary hover:bg-[#F5F9FA] transition-colors"
                >
                  <span>{option.label}</span>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-white"
                        : "border-[#747474]"
                    }`}
                  >
                    {isSelected && <FiCheck className="h-3.5 w-3.5" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
