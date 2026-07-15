import { FiSearch } from "react-icons/fi";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";
import MultiSelectDropdown from "./MultiSelectDropdown";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  placeholder?: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  singleSelect?: boolean;
}

export interface SortOption {
  label: string;
  value: string;
}

interface FilterSortSectionProps {
  // Search
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Dynamic filters shown inline on desktop
  filters: FilterConfig[];

  // Sort
  sortOptions: SortOption[];
  activeSortValue: string;
  onSortChange: (value: string) => void;
  sortPlaceholder?: string;

  // More Filters drawer trigger
  onMoreFiltersClick?: () => void;
}

export default function FilterSortSection({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters,
  sortOptions,
  activeSortValue,
  onSortChange,
  sortPlaceholder = "Sort",
  onMoreFiltersClick,
}: FilterSortSectionProps) {
  
  // Transform single sort value to value array for MultiSelectDropdown
  const handleSortChange = (values: string[]) => {
    onSortChange(values[0] || "");
  };

  const sortValueArray = activeSortValue ? [activeSortValue] : [];

  return (
    <div 
      className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full shadow-[0_2px_8px_rgba(73,95,104,0.04)]"
      data-name="filter bar"
    >
      {/* Left: Search Bar */}
      <div 
        className="border border-[#d4d5d8] border-solid flex gap-2 h-10 items-center px-3 py-2 rounded-[12px] w-full md:w-[300px] lg:w-[338px] shrink-0 focus-within:border-primary transition-colors bg-white"
        data-name="search bar"
      >
        <FiSearch className="text-text-darker h-6 w-6 shrink-0 size-5" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent outline-none text-base font-normal text-text-secondary placeholder-[#747474]"
        />
      </div>

      {/* Right: Filters & Sort Group */}
      <div className="flex flex-row items-center justify-between md:justify-end gap-4 lg:gap-6 w-full md:w-auto">
        {/* Desktop-only individual filter dropdowns */}
        {filters.length > 0 && (
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            {filters.map((filter) => (
              <MultiSelectDropdown
                key={filter.id}
                placeholder={filter.label}
                options={filter.options}
                value={filter.value}
                onChange={filter.onChange}
                variant="filter"
                singleSelect={filter.singleSelect}
              />
            ))}
          </div>
        )}

        {/* Action group: More Filters & Sort */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          {/* More Filters Button */}
          {onMoreFiltersClick && (
            <button
              type="button"
              onClick={onMoreFiltersClick}
              className="flex-1 md:flex-initial flex h-10 items-center justify-center gap-2 border border-[#d4d5d8] rounded-[12px] bg-white px-4 py-2 text-base font-medium text-primary hover:text-[#156d85] hover:border-primary transition-all duration-200 cursor-pointer"
            >
              <span>More Filters</span>
              <SlidersHorizontal className="size-5 text-current shrink-0" />
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="flex-1 md:flex-initial">
            <MultiSelectDropdown
              placeholder={sortPlaceholder}
              options={sortOptions}
              value={sortValueArray}
              onChange={handleSortChange}
              variant="filter"
              singleSelect={true}
              showChevron={false}
              icon={<ArrowUpDown className="size-5 text-current shrink-0" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
