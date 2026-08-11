// ─── PropertyDetailChip ────────────────────────────────────────────────────────
// A single label+value info chip used in the hero card detail grid.

interface PropertyDetailChipProps {
  label: string;
  value?: string | number;
  className?: string;
}

export default function PropertyDetailChip({
  label,
  value,
  className = "",
}: PropertyDetailChipProps) {
  return (
    <div
      className={`bg-[#EDEFF2] border border-border flex flex-col gap-1 items-start justify-center p-3 sm:p-4 rounded-md min-w-0 ${className}`}
    >
      <p className="font-poppins font-normal text-[13px] sm:text-[16px] text-text-darker leading-tight break-words w-full">
        {label}
      </p>
      <p className="font-poppins font-medium text-[15px] sm:text-[19px] text-text-secondary leading-snug break-words w-full">
        {value ?? "—"}
      </p>
    </div>
  );
}
