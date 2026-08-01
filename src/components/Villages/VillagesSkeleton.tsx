export default function VillagesSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Skeleton Filter/Sort Row */}
      <div 
        className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full shadow-[0_2px_8px_rgba(73,95,104,0.04)] animate-pulse"
      >
        {/* Search bar skeleton */}
        <div className="h-10 bg-[#EDEFF2] rounded-[12px] w-full md:w-[300px] lg:w-[338px]"></div>
        {/* Filters skeleton */}
        <div className="flex flex-row items-center justify-between md:justify-end gap-4 lg:gap-6 w-full md:w-auto">
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-[120px] h-10 bg-[#EDEFF2] rounded-[12px]"></div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="w-[120px] h-10 bg-[#EDEFF2] rounded-[12px]"></div>
          </div>
        </div>
      </div>

      {/* Skeleton Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white flex flex-col gap-[24px] items-end justify-center p-[16px] rounded-[20px] shadow-[0px_2px_6.3px_1px_rgba(0,0,0,0.14)] w-full"
          >
            <div className="flex flex-col gap-[16px] items-start w-full">
              {/* Village Image Placeholder */}
              <div className="h-[158px] rounded-[4px] w-full bg-[#EDEFF2] shrink-0"></div>

              {/* Text block: Name row + Stats row */}
              <div className="flex flex-col gap-[12px] items-start w-full">
                {/* Name / Developer — same row */}
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="w-[140px] h-[19px] rounded bg-[#EDEFF2]"></div>
                  <div className="w-[80px] h-[16px] rounded bg-[#EDEFF2]"></div>
                </div>

                {/* Stats — same row, justify-between */}
                <div className="flex items-center justify-between w-full mt-1">
                  {/* Starting price */}
                  <div className="flex flex-col gap-[6px] items-start">
                    <div className="w-[80px] h-[12px] rounded bg-[#EDEFF2]"></div>
                    <div className="w-[100px] h-[19px] rounded bg-[#EDEFF2]"></div>
                  </div>

                  {/* Rental Yield */}
                  <div className="flex flex-col gap-[6px] items-start">
                    <div className="w-[70px] h-[12px] rounded bg-[#EDEFF2]"></div>
                    <div className="w-[50px] h-[19px] rounded bg-[#EDEFF2]"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex gap-[20px] items-center w-full justify-between mt-2">
              <div className="flex gap-[8px] items-center">
                {/* Delete button */}
                <div className="w-[36px] h-[36px] rounded-[12px] bg-[#EDEFF2]"></div>
                {/* Edit button */}
                <div className="w-[36px] h-[36px] rounded-[12px] bg-[#EDEFF2]"></div>
              </div>

              {/* View Details button */}
              <div className="w-[130px] h-[36px] rounded-[12px] bg-[#EDEFF2]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
