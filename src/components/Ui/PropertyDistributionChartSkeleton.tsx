export default function PropertyDistributionChartSkeleton() {
  const barWidths = ["w-[80%]", "w-[40%]", "w-[65%]", "w-[30%]", "w-[55%]"];

  return (
    <div className="bg-white border border-border flex flex-col gap-6 p-6 rounded-md w-full min-h-[494px] h-auto justify-between animate-pulse">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* SVG icon placeholder */}
          <div className="w-6 h-6 bg-[#EDEFF2] rounded-sm"></div>
          {/* Title placeholder */}
          <div className="h-[23px] bg-[#EDEFF2] rounded w-44" />
        </div>
        {/* Subtitle placeholder */}
        <div className="h-4 bg-[#EDEFF2] rounded w-72 mt-1" />
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-1 px-2">
        <span className="w-3 h-3 bg-[#EDEFF2] inline-block rounded-xs"></span>
        <span className="h-3 bg-[#EDEFF2] rounded w-24 ml-1"></span>
      </div>

      {/* Graph Area */}
      <div className="flex-1 flex flex-col relative mt-2">
        {/* X-Axis Ticks (Grid Labels at the Top) */}
        <div className="flex justify-between pl-[120px] pr-2 pb-2 border-b border-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="w-8 h-3 bg-[#EDEFF2] rounded text-center"></span>
          ))}
        </div>

        {/* Chart Rows Container */}
        <div className="flex-1 flex flex-col gap-3 py-4 relative">
          {/* Vertical Gridlines Background */}
          <div className="absolute inset-y-0 left-[120px] right-2 flex justify-between pointer-events-none">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className={`h-full border-l border-dashed ${
                  idx === 0 ? "border-slate-300" : "border-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Rows */}
          {barWidths.map((width, index) => (
            <div key={index} className="flex items-center z-10 w-full">
              {/* Village Label */}
              <div className="w-[120px] min-w-[120px] pr-3 text-left">
                <div className="h-3 bg-[#EDEFF2] rounded w-20" />
              </div>

              {/* Bar Container */}
              <div className="flex-1 pr-2 relative h-8 flex items-center bg-slate-50/40 rounded-sm">
                <div className={`h-6 bg-[#EDEFF2] rounded-sm ${width}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
