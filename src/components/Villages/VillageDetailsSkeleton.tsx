
export default function VillageDetailsSkeleton() {
  return (
    <div className="w-full min-h-screen bg-[#f5f9fa] flex flex-col lg:flex-row gap-[24px] p-0 md:px-[32px] animate-pulse">
      {/* Left content panel */}
      <div className="flex-1 flex flex-col gap-[24px] max-w-full lg:max-w-[845px]">
        {/* Header banner card */}
        <div className="bg-white border border-border border-solid rounded-md flex flex-col md:flex-row gap-[24px] w-full items-stretch">
          {/* Cover image banner container */}
          <div className="w-full md:w-[378px] h-[250px] md:h-auto rounded-l-md overflow-hidden shrink-0 relative bg-[#EDEFF2]"></div>

          {/* Details stack on right */}
          <div className="flex-1 p-[24px] flex flex-col gap-[24px] justify-between">
            {/* Header metadata */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="w-[220px] h-[28px] bg-[#EDEFF2] rounded"></div>
              <div className="w-[140px] h-[18px] bg-[#EDEFF2] rounded mt-1"></div>
            </div>

            {/* Stats boxes grid (2x2 layout) */}
            <div className="grid grid-cols-2 gap-[16px] md:gap-[24px] w-full">
              {/* Box 1: Starting Price */}
              <div className="bg-[#edeff2]/40 border border-[#e4e5e8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[8px] items-start justify-center h-[80px]">
                <div className="w-[90px] h-[14px] bg-[#EDEFF2] rounded"></div>
                <div className="w-[120px] h-[20px] bg-[#EDEFF2] rounded"></div>
              </div>

              {/* Box 3: properties Count */}
              <div className="bg-[#edeff2]/40 border border-[#e4e5e8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[8px] items-start justify-center h-[80px]">
                <div className="w-[80px] h-[14px] bg-[#EDEFF2] rounded"></div>
                <div className="w-[50px] h-[20px] bg-[#EDEFF2] rounded"></div>
              </div>

              {/* Box 2: Amenities Count */}
              <div className="bg-[#edeff2]/40 border border-[#e4e5e8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[8px] items-start justify-center h-[80px]">
                <div className="w-[80px] h-[14px] bg-[#EDEFF2] rounded"></div>
                <div className="w-[40px] h-[20px] bg-[#EDEFF2] rounded"></div>
              </div>

              {/* Box 3: Rental Yield */}
              <div className="bg-[#edeff2]/40 border border-[#e4e5e8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[8px] items-start justify-center h-[80px]">
                <div className="w-[90px] h-[14px] bg-[#EDEFF2] rounded"></div>
                <div className="w-[50px] h-[20px] bg-[#EDEFF2] rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities section card */}
        <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-[24px] flex flex-col gap-[24px] w-full">
          <div className="w-[130px] h-[24px] bg-[#EDEFF2] rounded"></div>
          <div className="flex flex-wrap gap-[16px] items-center w-full">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-[100px] h-[40px] bg-[#EDEFF2] rounded-[44px]"
              ></div>
            ))}
          </div>
        </div>

        {/* Location Section Card */}
        <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] overflow-hidden w-full flex flex-col">
          <div className="h-[244px] w-full relative overflow-hidden shrink-0 bg-[#EDEFF2]"></div>
          <div className="p-[24px] flex flex-col items-start w-full gap-[8px]">
            <div className="w-[100px] h-[24px] bg-[#EDEFF2] rounded"></div>
            <div className="w-[200px] h-[16px] bg-[#EDEFF2] rounded"></div>
          </div>
        </div>
      </div>

      {/* Right gallery sidebar column */}
      <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-[24px] flex flex-col gap-[24px] w-full lg:w-[411px] shrink-0">
        <div className="w-[150px] h-[24px] bg-[#EDEFF2] rounded"></div>
        <div className="flex flex-col gap-[24px] w-full">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-[153px] rounded-[12px] bg-[#EDEFF2] w-full shrink-0"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
