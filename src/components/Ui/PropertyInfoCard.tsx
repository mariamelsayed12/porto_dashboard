// ─── PropertyInfoCard ─────────────────────────────────────────────────────────
// Shows property description text and amenity chips.

interface PropertyInfoCardProps {
  description?: string;
  amenities?: string[];
}

export default function PropertyInfoCard({ description, amenities }: PropertyInfoCardProps) {
  return (
    <div className="bg-white border border-border rounded-md p-6 flex flex-col gap-6 w-full">

      {/* Description */}
      <div className="flex flex-col gap-4">
        <p className="font-poppins font-medium text-[23px] text-text-secondary leading-none">
          Description
        </p>
        <p className="font-poppins font-normal text-[16px] text-text-darker leading-relaxed">
          {description ||
            "No description available for this property yet."}
        </p>
      </div>

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-poppins font-medium text-[23px] text-text-secondary leading-none">
            Amenities
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            {amenities.map((amenity) => (
              <span
                key={amenity}
                className="bg-white border border-border px-3 py-2 rounded-full font-poppins font-normal text-[16px] text-text-darker whitespace-nowrap"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
