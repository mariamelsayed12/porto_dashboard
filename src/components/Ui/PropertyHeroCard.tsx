import type { Property } from "../../interface";
import PropertyDetailChip from "./PropertyDetailChip";

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusStyles: Record<string, string> = {
  available: "bg-[#EDF6EB] text-[#141414]",
  "available soon": "bg-[#FFF5E6] text-[#9a7500]",
  pending: "bg-[#FFF5E6] text-[#9a7500]",
  sold: "bg-[#FDE7E7] text-[#c0280f]",
  "sold out": "bg-[#FDE7E7] text-[#c0280f]",
  rented: "bg-[#E9F4F7] text-[#1E8CAB]",
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusStyles[status.toLowerCase()] ?? "bg-light-gray text-text-darker";
  return (
    <span className={`inline-flex items-center px-3 py-2 rounded-md text-[14px] font-medium whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

// ─── PropertyHeroCard ─────────────────────────────────────────────────────────

interface PropertyHeroCardProps {
  property: Property;
  fallbackImage?: string;
}

export default function PropertyHeroCard({ property, fallbackImage }: PropertyHeroCardProps) {
  const src = property.image || fallbackImage;

  return (
    <div className="bg-white border border-border rounded-md flex flex-col md:flex-row overflow-hidden w-full">

      {/* Left — Image */}
      <div className="w-full md:w-[44%] shrink-0 h-[220px] md:h-auto min-h-[220px] relative">
        {src ? (
          <img
            src={src}
            alt={property.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-light-gray flex items-center justify-center text-text-darker text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Right — Info */}
      <div className="flex flex-col gap-6 p-6 flex-1 min-w-0">

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 w-full">
          <p className="font-poppins font-medium text-[23px] text-text-secondary leading-none shrink min-w-0 truncate">
            {property.name}
          </p>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={property.status} />
            {property.lastUpdated && (
              <span className="font-poppins font-normal text-[14px] text-text-darker whitespace-nowrap">
                {property.lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Detail chip grid */}
        <div className="flex flex-col gap-4 w-full">
          {/* Row 1: Village | Type */}
          <div className="flex gap-4">
            <PropertyDetailChip label="Village" value={property.village} className="flex-1 min-w-0" />
            <PropertyDetailChip label="Type" value={property.listingType} className="flex-1 min-w-0" />
          </div>

          {/* Row 2: Finishing | Orientation */}
          <div className="flex gap-4">
            <PropertyDetailChip label="Finishing" value={property.finishingStatus} className="flex-1 min-w-0" />
            <PropertyDetailChip label="Orientation" value={property.orientation} className="flex-1 min-w-0" />
          </div>

          {/* Row 3: Area | Bedrooms | Bathrooms */}
          <div className="flex gap-4">
            <PropertyDetailChip label="Area (sq.m)" value={property.area} className="flex-1 min-w-0" />
            <PropertyDetailChip label="Bedrooms" value={property.bedrooms} className="flex-1 min-w-0" />
            <PropertyDetailChip label="Bathrooms" value={property.bathrooms} className="flex-1 min-w-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
