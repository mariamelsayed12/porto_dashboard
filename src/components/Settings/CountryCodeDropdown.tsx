import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export interface CountryOption {
  label: string; // E.g., "Eg", "Sa", "Ae"
  code: string;  // E.g., "+20", "+966", "+971"
  flag: string;  // E.g., "🇪🇬", "🇸🇦", "🇦🇪"
  fullName: string;
}

export const countryOptions: CountryOption[] = [
  { label: "Eg", code: "+20", flag: "🇪🇬", fullName: "Egypt" },
  { label: "Sa", code: "+966", flag: "🇸🇦", fullName: "Saudi Arabia" },
  { label: "Ae", code: "+971", flag: "🇦🇪", fullName: "United Arab Emirates" },
  { label: "Kw", code: "+965", flag: "🇰🇼", fullName: "Kuwait" },
  { label: "Qa", code: "+974", flag: "🇶🇦", fullName: "Qatar" },
  { label: "Us", code: "+1", flag: "🇺🇸", fullName: "United States" },
  { label: "Gb", code: "+44", flag: "🇬🇧", fullName: "United Kingdom" },
];

interface CountryCodeDropdownProps {
  value: CountryOption;
  onChange: (option: CountryOption) => void;
  disabled?: boolean;
}

export default function CountryCodeDropdown({
  value,
  onChange,
  disabled = false,
}: CountryCodeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSelect = (option: CountryOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0 w-[108px] h-12">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full h-full flex items-center justify-between
          border border-[#747474] rounded-sm bg-white px-3 py-2.5
          text-text-darker text-[13px] font-normal cursor-pointer select-none
          hover:border-[#464646] transition-colors focus:outline-none focus:ring-1 focus:ring-[#1E8CAB] focus:border-[#1E8CAB]
          disabled:bg-slate-50 disabled:border-gray-200 disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        <span className="flex items-center gap-1">
          <span>{value.label}</span>
          <span>{value.code}</span>
        </span>
        <FiChevronDown
          size={16}
          className={`text-text-darker transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-1.5 w-[220px] max-h-[260px] overflow-y-auto bg-white border border-[#D4D5D8] rounded-md shadow-lg z-50 py-1 scroll-smooth"
          >
            {countryOptions.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => handleSelect(option)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm text-text-darker hover:bg-[#E9F4F7] hover:text-primary transition-colors
                  ${value.code === option.code ? "bg-[#E9F4F7] text-primary font-medium" : "font-normal"}
                `}
              >
                <span className="text-lg">{option.flag}</span>
                <span className="flex-1 truncate">{option.fullName}</span>
                <span className="text-xs text-text-naturalGray">{option.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
