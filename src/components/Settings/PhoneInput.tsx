import CountryCodeDropdown, { type CountryOption } from "./CountryCodeDropdown";
import Input from "../Ui/Input";

interface PhoneInputProps {
  label: string;
  required?: boolean;
  countryValue: CountryOption;
  onCountryChange: (option: CountryOption) => void;
  phoneValue: string;
  onPhoneChange: (val: string) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}

export default function PhoneInput({
  label,
  required = false,
  countryValue,
  onCountryChange,
  phoneValue,
  onPhoneChange,
  error,
  helperText,
  placeholder = "Input text",
  disabled = false,
  name,
}: PhoneInputProps) {
  return (
    <div className="flex flex-col w-full gap-2">
      {/* Label */}
      <label className="text-base text-text-secondary select-none font-normal">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>

      {/* Row container */}
      <div className="flex gap-2 items-start w-full">
        <CountryCodeDropdown
          value={countryValue}
          onChange={onCountryChange}
          disabled={disabled}
        />
        <Input
          type="text"
          name={name}
          placeholder={placeholder}
          value={phoneValue}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={error}
          disabled={disabled}
          containerClassName="flex-1"
          variant="modal"
          size="md"
        />
      </div>
      
      {/* If we have helperText but no error, render it below the entire component */}
      {!error && helperText && (
        <span className="text-xs text-text-naturalGray mt-0.5">{helperText}</span>
      )}
    </div>
  );
}
