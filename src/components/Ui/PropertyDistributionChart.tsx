import { motion } from "framer-motion";
import PropertyDistributionChartSkeleton from "./PropertyDistributionChartSkeleton";

interface ChartData {
  _id: string;
  name: string;
  slug: string;
  coverImage: string;
  propertyCount: number;
}

interface PropertyDistributionChartProps {
  data?: ChartData[];
  isLoading?: boolean;
}

export default function PropertyDistributionChart({ data = [], isLoading }: PropertyDistributionChartProps) {
  if (isLoading) {
    return <PropertyDistributionChartSkeleton />;
  }
  // Find dynamic maximum value from data
  const maxCount = data.reduce((max, item) => Math.max(max, item.propertyCount), 0);
  // Round up to the nearest multiple of 10 to ensure neat ticks (minimum of 10 to avoid 0-bound issues)
  const maxVal = maxCount > 0 ? Math.ceil(maxCount / 10) * 10 : 100;

  // Generate 6 grid ticks dynamically (0, 20%, 40%, 60%, 80%, 100% of maxVal)
  const gridTicks = Array.from({ length: 6 }, (_, i) => Math.round((maxVal / 5) * i));

  return (
    <div className="bg-white border border-border flex flex-col gap-6 p-6 rounded-md w-full min-h-[494px] h-auto justify-between">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center text-text-darker">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5V19C4 19.5304 4.21071 20.0391 4.58579 20.4142C4.96086 20.7893 5.46957 21 6 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M17 14L13 10L9 14L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="font-medium text-[19px] text-text-darker">
            Property distribution
          </h3>
        </div>
        <p className="font-normal text-[16px] text-text-darker">
          Number of available properties in each village.
        </p>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center gap-1 px-2">
        <span className="w-3 h-3 bg-[#0d3b48] inline-block rounded-xs"></span>
        <span className="text-[12px] font-normal text-text-darker ml-1">
          properties number
        </span>
      </div>

      {/* Graph Area */}
      <div className="flex-1 flex flex-col relative mt-2">
        {/* X-Axis Ticks (Grid Labels at the Top) */}
        <div className="flex justify-between pl-[120px] pr-2 pb-2 text-[12px] font-normal text-text-darker border-b border-border">
          {gridTicks.map((tick) => (
            <span key={tick} className="w-8 text-center">
              {tick}
            </span>
          ))}
        </div>

        {/* Chart Rows Container */}
        <div className="flex-1 flex flex-col gap-3 py-4 relative">
          {/* Vertical Gridlines Background */}
          <div className="absolute inset-y-0 left-[120px] right-2 flex justify-between pointer-events-none">
            {gridTicks.map((tick, idx) => (
              <div
                key={tick}
                className={`h-full border-l border-dashed ${
                  idx === 0 ? "border-slate-300" : "border-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Rows */}
          {data.map((item, index) => {
            const percentage = maxVal > 0 ? Math.min((item.propertyCount / maxVal) * 100, 100) : 0;

            return (
              <div key={index} className="flex items-center z-10 w-full group">
                {/* Village Label */}
                <div className="w-[120px] min-w-[120px] pr-3 text-left">
                  <span className="text-[12px] font-normal text-text-darker truncate block" title={item.name}>
                    {item.name}
                  </span>
                </div>

                {/* Bar Container */}
                <div className="flex-1 pr-2 relative h-8 flex items-center bg-slate-50/40 rounded-sm">
                  {/* The Animated Bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                    className="h-6 bg-[#0D3B48] bg-opacity-90 rounded-sm shadow-xs relative flex items-center justify-end pr-2 group-hover:bg-opacity-100 transition-all"
                  >
                    {/* Tooltip on hover */}
                    {item.propertyCount > 10 && (
                      <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.propertyCount}
                      </span>
                    )}
                  </motion.div>

                  {/* Number display for very small bars */}
                  {item.propertyCount <= 10 && (
                    <span className="text-text-darker text-[10px] font-medium ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.propertyCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
