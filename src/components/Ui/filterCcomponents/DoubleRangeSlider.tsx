import React, { useEffect, useState } from "react";

interface DoubleRangeSliderProps {
  min: number;
  max: number;
  valueFrom: number | string;
  valueTo: number | string;
  onChange: (from: number, to: number) => void;
  step?: number;
  unit: string;
  formatValue?: (val: number) => string;
}

export const DoubleRangeSlider = ({
  min,
  max,
  valueFrom,
  valueTo,
  onChange,
  step = 1,
  unit,
  formatValue = (val) => String(val),
}: DoubleRangeSliderProps) => {
  // Convert inputs to numbers, fallback to min/max if empty/invalid
  const valMin = valueFrom === "" ? min : Math.max(min, Math.min(max, Number(valueFrom)));
  const valMax = valueTo === "" ? max : Math.max(min, Math.min(max, Number(valueTo)));

  // Local state for smooth dragging without triggering parent renders/queries
  const [localMin, setLocalMin] = useState(valMin);
  const [localMax, setLocalMax] = useState(valMax);

  // Keep local state in sync when props change from outside (e.g. Reset or typing in input fields)
  useEffect(() => {
    setLocalMin(valMin);
  }, [valMin]);

  useEffect(() => {
    setLocalMax(valMax);
  }, [valMax]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(value);
  };

  const handleCommit = () => {
    onChange(localMin, localMax);
  };

  // Calculate percentages for the background track bar
  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="relative w-full mt-6 mb-2 px-1">
      {/* Slider container with fixed height where track, inputs, and thumbs align to center */}
      <div className="relative w-full h-6 flex items-center">
        {/* Track bar */}
        <div className="relative h-1 bg-[#E8EFF1] rounded-full w-full">
          <div
            className="absolute h-full bg-[#0A2540] rounded-full"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Hidden range inputs with custom styling */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-0 pointer-events-none appearance-none cursor-pointer focus:outline-none"
          style={{
            WebkitAppearance: "none",
            zIndex: localMin > max - 100 ? 5 : 3,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          onMouseUp={handleCommit}
          onTouchEnd={handleCommit}
          className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-0 pointer-events-none appearance-none cursor-pointer focus:outline-none"
          style={{
            WebkitAppearance: "none",
            zIndex: 4,
          }}
        />

        {/* Custom thumb elements mapped to slider inputs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow pointer-events-none hover:scale-110 transition-transform"
          style={{
            left: `calc(${minPercent}% - 8px)`,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full shadow pointer-events-none hover:scale-110 transition-transform"
          style={{
            left: `calc(${maxPercent}% - 8px)`,
          }}
        />
      </div>

      {/* Display values under the slider */}
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#7D8D93]">
        <span>{`${formatValue(localMin)} ${unit}`}</span>
        <span>{`${formatValue(localMax)} ${unit}`}</span>
      </div>
    </div>
  );
};
