export default function PropertyDetailsSkeleton() {
  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start animate-pulse">
      {/* ── Left Column (main content) ─────────────────────────────────────── */}
      <div className="flex-col gap-6 flex-1 min-w-0 w-full flex">
        {/* Hero card skeleton */}
        <div className="bg-white border border-border rounded-lg flex flex-col w-full overflow-hidden">
          {/* Main cover image banner placeholder */}
          <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full bg-[#EDEFF2]" />

          {/* Details metadata */}
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {/* Title */}
              <div className="w-1/2 h-7 bg-[#EDEFF2] rounded" />
              {/* Location / Village */}
              <div className="w-1/4 h-5 bg-[#EDEFF2] rounded mt-1" />
            </div>

            {/* Spec Chips block */}
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-[100px] h-[36px] bg-[#EDEFF2] rounded-full" />
              ))}
            </div>

            {/* Specifications grid (Bedrooms, Bathrooms, Area, etc.) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#D4D5D8]">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="w-16 h-4 bg-[#EDEFF2] rounded" />
                  <div className="w-24 h-6 bg-[#EDEFF2] rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description + Amenities skeleton */}
        <div className="bg-white border border-border rounded-lg p-6 flex flex-col gap-6 w-full">
          {/* Description section */}
          <div className="flex flex-col gap-3">
            <div className="w-[120px] h-6 bg-[#EDEFF2] rounded" />
            <div className="flex flex-col gap-2 mt-2">
              <div className="w-full h-4 bg-[#EDEFF2] rounded" />
              <div className="w-full h-4 bg-[#EDEFF2] rounded" />
              <div className="w-3/4 h-4 bg-[#EDEFF2] rounded" />
            </div>
          </div>

          <hr className="border-[#D4D5D8]" />

          {/* Amenities section */}
          <div className="flex flex-col gap-4">
            <div className="w-[100px] h-6 bg-[#EDEFF2] rounded" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="w-[110px] h-[38px] bg-[#EDEFF2] rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Column (sidebar) ────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 w-full lg:w-[411px] shrink-0">
        {/* Pricing card skeleton */}
        <div className="bg-white border border-border rounded-lg p-6 flex flex-col gap-6 w-full">
          <div className="w-[150px] h-6 bg-[#EDEFF2] rounded" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="w-24 h-4 bg-[#EDEFF2] rounded" />
                <div className="w-32 h-6 bg-[#EDEFF2] rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Gallery card skeleton */}
        <div className="bg-white border border-border rounded-lg p-6 flex flex-col gap-4 w-full">
          <div className="w-[120px] h-6 bg-[#EDEFF2] rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[90px] rounded-lg bg-[#EDEFF2] w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
