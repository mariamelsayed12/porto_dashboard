import { FiSearch } from "react-icons/fi";
import mapMockup from "../../assets/map-mockup.png";
import Input from "./Input";

interface LocationPickerProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function LocationPicker({
  label = "Location",
  required = false,
  value = "",
  onChange,
  error,
}: LocationPickerProps) {
  // Use a default address if none is provided yet
  const displayAddress = value || "760 Market Street, San Francisco, CA 94107";

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Search Input using Input component */}
      <Input
        label={label}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search location"
        leftIcon={<FiSearch className="w-5 h-5" />}
        error={error}
        variant="modal"
        size="md"
      />

      {/* Map View Container */}
      <div className="relative h-[194px] w-full rounded-xl overflow-hidden border border-border">
        {/* Map Background */}
        <img
          src={mapMockup}
          alt="Map background"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Address Overlay Badge */}
        <div className="absolute top-[57px] left-1/2 -translate-x-1/2 bg-[rgba(15,15,20,0.88)] text-white px-2.5 py-1.5 rounded-lg text-[11px] font-medium font-sans whitespace-nowrap shadow-md z-10">
          {displayAddress}
        </div>

        {/* Pin Marker Overlay */}
        <div className="absolute top-[110px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          {/* Custom Pin SVG matching Figma */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <path
              d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
              fill="#1E8CAB"
            />
            <circle cx="12" cy="9" r="3" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
