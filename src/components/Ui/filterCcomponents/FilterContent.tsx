import { useState, useMemo } from "react";
import type { FilterState } from "../../../hooks/useUnitsFilter";
import Button from "../Button";
import Input from "../Input";
import { DoubleRangeSlider } from "./DoubleRangeSlider";
import { useGetVillageQuery } from "../../../../app/services/crudVillage";
import { useGetPropertyQuery, type IProperty } from "../../../../app/services/crudproperties";
import { PROPERTY_TYPES } from "../../../data";
import { getPriceForProperty } from "../../../hooks/useUnitsFilter";

interface FilterContentProps {
  tempFilters: FilterState;
  setTempFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  handleReset: () => void;
  handleApply: () => void;
  tempFilteredCount: number;
  /** Whether the footer buttons should be visually "sticky" (drawer) or in normal flow (static). */
  stickyFooter?: boolean;
  displayMode?: "drawer" | "static";
  properties?: IProperty[];
}
 
const FilterContent = ({
  tempFilters,
  setTempFilters,
  handleReset,
  handleApply,
  tempFilteredCount,
  stickyFooter = true,
  displayMode = "drawer",
  properties = [],
}: FilterContentProps) => {
  const { data: villagesList, isLoading: isLocationsLoading, isFetching: isLocationsFetching } = useGetVillageQuery();
  const { isLoading: isPropertiesLoading, isFetching: isPropertiesFetching } = useGetPropertyQuery();

  const isLocationsLoadingOrFetching = isLocationsLoading || isLocationsFetching;
  const isDeliveryLoadingOrFetching = isPropertiesLoading || isPropertiesFetching;

  const [visibleLocationsCount, setVisibleLocationsCount] = useState(6);
  const [visiblePropertyTypesCount, setVisiblePropertyTypesCount] = useState(4);

  const handleTogglePropertyType = (type: string) => {
    setTempFilters((prev) => {
      const currentTypes = prev.propertyType
        ? prev.propertyType.split(",").map((t) => t.trim())
        : [];
      const exists = currentTypes.includes(type);
      const updatedTypes = exists
        ? currentTypes.filter((item) => item !== type)
        : [...currentTypes, type];
      return {
        ...prev,
        propertyType: updatedTypes.join(","),
      };
    });
  };

  const handleToggleLocation = (loc: string) => {
    setTempFilters((prev) => {
      const currentLocations = prev.location
        ? prev.location.split(",").map((l) => l.trim())
        : [];
      const exists = currentLocations.includes(loc);
      const updatedLocations = exists
        ? currentLocations.filter((item) => item !== loc)
        : [...currentLocations, loc];
      return {
        ...prev,
        location: updatedLocations.join(","),
      };
    });
  };
 
  const handleToggleBedrooms = (num: string) => {
    setTempFilters((prev) => ({
      ...prev,
      bedrooms: prev.bedrooms === num ? "" : num,
    }));
  };
 
  const handleToggleBathrooms = (num: string) => {
    setTempFilters((prev) => ({
      ...prev,
      bathrooms: prev.bathrooms === num ? "" : num,
    }));
  };
 
  const handleToggleDeliveryDate = (date: string) => {
    setTempFilters((prev) => ({
      ...prev,
      deliveryDate: prev.deliveryDate === date ? "" : date,
    }));
  };
 
  const handleToggleFinishing = (finish: string) => {
    setTempFilters((prev) => ({
      ...prev,
      finishing: prev.finishing === finish ? "" : finish,
    }));
  };

  // Dynamically calculate Area and Price bounds from active properties list
  const { minArea, maxArea, minPrice, maxPrice } = useMemo(() => {
    if (!properties || properties.length === 0) {
      return { minArea: 0, maxArea: 1000, minPrice: 0, maxPrice: 100000000 };
    }
    const areas = properties
      .map((u) => u.area)
      .filter((a): a is number => typeof a === "number" && !isNaN(a));
    const prices = properties
      .map((u) => getPriceForProperty(u))
      .filter((p): p is number => typeof p === "number" && !isNaN(p));

    const minA = 0;
    const maxA = areas.length ? Math.max(...areas) : 1000;
    const minP = prices.length ? Math.min(...prices) : 0;
    const maxP = prices.length ? Math.max(...prices) : 100000000;

    return { minArea: minA, maxArea: maxA, minPrice: minP, maxPrice: maxP };
  }, [properties]);

  // Keep selected property types visible in See More/Less list
  const visiblePropertyTypes = useMemo(() => {
    const selectedTypes = tempFilters.propertyType
      ? tempFilters.propertyType.split(",").map((t) => t.trim().toLowerCase())
      : [];
    return PROPERTY_TYPES.filter((type, index) => {
      const isSelected = selectedTypes.includes(type.toLowerCase());
      return index < visiblePropertyTypesCount || isSelected;
    });
  }, [visiblePropertyTypesCount, tempFilters.propertyType]);

  // Keep selected locations visible in See More/Less list
  const visibleDestinations = useMemo(() => {
    if (!villagesList) return [];
    const selectedNames = tempFilters.location
      ? tempFilters.location.split(",").map((name) => name.trim().toLowerCase())
      : [];
    return villagesList.filter((dest, index) => {
      const isSelected = selectedNames.includes(dest.name.toLowerCase());
      return index < visibleLocationsCount || isSelected;
    });
  }, [villagesList, visibleLocationsCount, tempFilters.location]);

  // Dynamically extract and sort delivery date options
  const deliveryDateOptions = useMemo(() => {
    if (!properties || properties.length === 0) {
      return ["Ready", "2027", "2028", "2029", "2030", "2031", "2032"];
    }
    const dates = properties
      .map((u) => u.deliveryDate)
      .filter((date): date is string => typeof date === "string" && date.trim() !== "");

    const mapped = dates.map((date) => {
      const trimmed = date.trim();
      const hasYear = /\b(19|20|21)\d{2}\b/.test(trimmed);
      if (hasYear) {
        return trimmed.includes("-") ? trimmed.split("-")[0] : trimmed;
      }
      return trimmed;
    });

    const uniqueDates = Array.from(new Set(mapped));

    uniqueDates.sort((a, b) => {
      const getYear = (s: string) => {
        const match = /\b(19|20|21)\d{2}\b/.exec(s);
        return match ? parseInt(match[0], 10) : null;
      };
      const yearA = getYear(a);
      const yearB = getYear(b);
      if (yearA !== null && yearB !== null) {
        return yearA - yearB;
      }
      if (yearA !== null) return 1;
      if (yearB !== null) return -1;
      return a.localeCompare(b);
    });

    return uniqueDates;
  }, [properties]);

  const getDisplayLabel = (date: string) => {
    const trimmed = date.trim();
    const isYear = /^\b(19|20|21)\d{2}\b/.test(trimmed);
    if (isYear) {
      return trimmed;
    }
    if (trimmed.toLowerCase() === "ready" || trimmed.toLowerCase() === "ready to move") {
      return "Ready to Move";
    }
    return trimmed;
  };
 
  return (
    <>
      {displayMode === "static" && (
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#E8EFF1] bg-[#F5F9FA]">
          <span className="text-sm font-semibold text-[#141414]">
            Filters <span className="text-xs font-normal text-[#7D8D93]">({tempFilteredCount} Result)</span>
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Scrollable Content */}
      <div
        className={`flex-1 overflow-y-auto px-6 py-5 space-y-4 ${
          stickyFooter ? "pb-28" : ""
        }`}
      >
        {/* Property Type Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Property type
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, propertyType: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {visiblePropertyTypes.map((type) => {
                const isSelected = (tempFilters.propertyType || "")
                  .toLowerCase()
                  .split(",")
                  .map((t) => t.trim())
                  .includes(type.toLowerCase());
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTogglePropertyType(type)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-[#E9F4F7] border-primary text-[#141414]"
                        : "bg-white border-[#D9E1E4] text-[#58696F] hover:border-gray-300"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
            {PROPERTY_TYPES.length > 4 && (
              <button
                type="button"
                onClick={() =>
                  setVisiblePropertyTypesCount((prev) =>
                    prev === PROPERTY_TYPES.length ? 4 : PROPERTY_TYPES.length
                  )
                }
                className="text-xs font-semibold text-primary hover:underline mt-2 self-start cursor-pointer block"
              >
                {visiblePropertyTypesCount === PROPERTY_TYPES.length ? "See Less" : "See More"}
              </button>
            )}
          </div>
        </div>
 

        {/* location */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Location
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, location: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          {isLocationsLoadingOrFetching ? (
            <div className="flex flex-wrap gap-2 animate-pulse">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-8 bg-[#E8EFF1] rounded-full w-24 sm:w-28 border border-[#E8EFF1]"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {visibleDestinations.map(({ name }) => {
                  const isSelected = (tempFilters.location || "")
                    .toLowerCase()
                    .split(",")
                    .map((l) => l.trim())
                    .includes(name.toLowerCase());
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleToggleLocation(name)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                        isSelected
                          ? "bg-[#E9F4F7] border-primary text-[#141414]"
                          : "bg-white border-[#D9E1E4] text-[#58696F] hover:border-gray-300"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              {(villagesList || []).length > 6 && (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleLocationsCount((prev) =>
                      prev === (villagesList || []).length ? 6 : (villagesList || []).length
                    )
                  }
                  className="text-xs font-semibold text-primary hover:underline mt-2 self-start cursor-pointer block"
                >
                  {visibleLocationsCount === (villagesList || []).length ? "See Less" : "See More"}
                </button>
              )}
            </div>
          )}
        </div>


        {/* Bedrooms Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Bedrooms
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, bedrooms: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {["1", "2", "3", "4", "5+"].map((num) => {
              const isSelected = tempFilters.bedrooms === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleToggleBedrooms(num)}
                  className={`h-10 min-w-10 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-[#E9F4F7] border-primary text-[#141414]"
                      : "bg-white border-[#D9E1E4] text-[#58696F] hover:border-gray-300"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
 
        {/* Bathrooms Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Bathrooms
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, bathrooms: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {["1", "2", "3+"].map((num) => {
              const isSelected = tempFilters.bathrooms === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleToggleBathrooms(num)}
                  className={`h-10 min-w-10 rounded-full flex items-center justify-center text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-[#E9F4F7] border-primary text-[#141414]"
                      : "bg-white border-[#D9E1E4] text-[#58696F] hover:border-gray-300"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
        
 
        {/* Area Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Area{" "}
              <span className="text-xs font-normal text-[#7D8D93]">(m2)</span>
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, areaFrom: "", areaTo: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#7D8D93] mb-1.5">
                From
              </label>
              <Input
                type="number"
                value={tempFilters.areaFrom}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    areaFrom: e.target.value,
                  }))
                }
                className="h-10 text-xs border-[#D9E1E4]"
                placeholder={String(minArea)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7D8D93] mb-1.5">
                To
              </label>
              <Input
                type="number"
                value={tempFilters.areaTo}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    areaTo: e.target.value,
                  }))
                }
                className="h-10 text-xs border-[#D9E1E4]"
                placeholder={String(maxArea)}
              />
            </div>
          </div>
 
          {/* Double Range Slider for Area */}
          <DoubleRangeSlider
            min={minArea}
            max={maxArea}
            valueFrom={tempFilters.areaFrom}
            valueTo={tempFilters.areaTo}
            unit="m²"
            onChange={(from, to) =>
              setTempFilters((prev) => ({
                ...prev,
                areaFrom: from === minArea ? "" : String(from),
                areaTo: to === maxArea ? "" : String(to),
              }))
            }
          />
        </div>
 
        {/* Price Range Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Price range{" "}
              <span className="text-xs font-normal text-[#7D8D93]">(EGP)</span>
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, priceFrom: "", priceTo: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#7D8D93] mb-1.5">
                From
              </label>
              <Input
                type="number"
                value={tempFilters.priceFrom}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    priceFrom: e.target.value,
                  }))
                }
                className="h-10 text-xs border-[#D9E1E4]"
                placeholder={String(minPrice)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7D8D93] mb-1.5">
                To
              </label>
              <Input
                type="number"
                value={tempFilters.priceTo}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    priceTo: e.target.value,
                  }))
                }
                className="h-10 text-xs border-[#D9E1E4]"
                placeholder={String(maxPrice)}
              />
            </div>
          </div>
 
          {/* Double Range Slider for Price */}
          <DoubleRangeSlider
            min={minPrice}
            max={maxPrice}
            step={50000}
            valueFrom={tempFilters.priceFrom}
            valueTo={tempFilters.priceTo}
            unit="EGP"
            formatValue={(val) => val.toLocaleString()}
            onChange={(from, to) =>
              setTempFilters((prev) => ({
                ...prev,
                priceFrom: from === minPrice ? "" : String(from),
                priceTo: to === maxPrice ? "" : String(to),
              }))
            }
          />
        </div>
 
        {/* Payments Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Payments{" "}
              <span className="text-xs font-normal text-[#7D8D93]">(EGP)</span>
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, downPayment: "", monthlyInstallment: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#7D8D93] mb-1.5">
                Down Payment
              </label>
              <Input
                type="number"
                value={tempFilters.downPayment}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    downPayment: e.target.value,
                  }))
                }
                className="h-10 text-xs border-[#D9E1E4]"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#7D8D93] mb-1.5">
                Monthly Installments
              </label>
              <Input
                type="number"
                value={tempFilters.monthlyInstallment}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    monthlyInstallment: e.target.value,
                  }))
                }
                className="h-10 text-xs border-[#D9E1E4]"
                placeholder="0"
              />
            </div>
          </div>
        </div>
 
        {/* Delivery Date Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Delivery Date
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, deliveryDate: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          {isDeliveryLoadingOrFetching ? (
            <div className="flex flex-wrap gap-2 animate-pulse">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-8 bg-[#E8EFF1] rounded-full w-16 sm:w-20 border border-[#E8EFF1]"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {deliveryDateOptions.map((date) => {
                const isSelected =
                  (tempFilters.deliveryDate || "").toLowerCase() ===
                  date.toLowerCase();
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => handleToggleDeliveryDate(date)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-[#E9F4F7] border-primary text-[#141414]"
                        : "bg-white border-[#D9E1E4] text-[#58696F] hover:border-gray-300"
                    }`}
                  >
                    {getDisplayLabel(date)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
 
        {/* Finishing Card */}
        <div className="bg-white rounded-md border border-border p-5 shadow-[0_2px_8px_rgba(73,95,104,0.04)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-bold text-text-secondary">
              Finishing
            </h3>
            {displayMode === "static" && (
              <button
                type="button"
                onClick={() => setTempFilters((prev) => ({ ...prev, finishing: "" }))}
                className="text-xs font-semibold text-[#1E8CAB] hover:underline cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "Not finished",
              "Semi finished",
              "Finished",
              "Fully furnished",
            ].map((finish) => {
              const isSelected =
                (tempFilters.finishing || "").toLowerCase() ===
                finish.toLowerCase();
              return (
                <button
                  key={finish}
                  type="button"
                  onClick={() => handleToggleFinishing(finish)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-[#E9F4F7] border-primary text-[#141414]"
                      : "bg-white border-[#D9E1E4] text-[#58696F] hover:border-gray-300"
                  }`}
                >
                  {finish}
                </button>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* Footer (Reset / Apply) */}
      {displayMode !== "static" && (
        <div
          className={`${
            stickyFooter ? "absolute bottom-0 inset-x-0" : "relative mt-4"
          } bg-white border-t border-[#E8EFF1] p-4 flex gap-4`}
        >
          <Button
            type="button"
            onClick={handleReset}
            className="w-1/2 rounded-md border border-border bg-white !text-black font-bold hover:bg-gray-50 h-12 text-sm"
          >
            Reset All
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="w-1/2 rounded-xl bg-primary text-white font-bold hover:opacity-95 h-12 text-sm"
          >
            Apply Filter ({tempFilteredCount})
          </Button>
        </div>
      )}
    </>
  );
};

export default FilterContent;