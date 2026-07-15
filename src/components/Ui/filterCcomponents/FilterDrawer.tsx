import { useEffect, useRef } from "react";
import type { FilterState } from "../../../hooks/useUnitsFilter";
import FilterContent from "./FilterContent";
import {motion,AnimatePresence} from "framer-motion"
import { X } from "lucide-react";

interface FilterDrawerProps {
  /** Only relevant to displayMode="drawer". Controls whether the drawer is open. */
  isOpen?: boolean;
  onClose?: () => void;
  tempFilters: FilterState;
  setTempFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  applyFilters: () => void;
  resetFilters: () => void;
  tempFilteredCount: number;
  /**
   * "drawer" (default) — current slide-in sidebar behavior, unchanged.
   * "static" — renders the same filter content inline on the page, always visible,
   * with no overlay, no slide animation, and no dependency on isOpen/onClose.
   */
  displayMode?: "drawer" | "static";
  /** Optional className for the static container (e.g. width/positioning on the page). */
  className?: string;
}
 
const FilterDrawer = ({
  isOpen = false,
  onClose,
  tempFilters,
  setTempFilters,
  applyFilters,
  resetFilters,
  tempFilteredCount,
  displayMode = "drawer",
  className = "",
}: FilterDrawerProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
 
  const handleReset = () => {
    resetFilters();
  };
 
  const handleApply = () => {
    applyFilters();
    onClose?.();
  };
 
  // Auto-apply filters when tempFilters changes in static mode.
  useEffect(() => {
    if (displayMode === "static") {
      applyFilters();
    }
  }, [tempFilters, applyFilters, displayMode]);
 
  // Handle Escape key to close the drawer + lock background scroll.
  // Only relevant in "drawer" mode.
  useEffect(() => {
    if (displayMode !== "drawer") return;
 
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling when drawer is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, displayMode]);
 
  /* ---------------------------- Static Mode ---------------------------- */
  if (displayMode === "static") {
    return (
      <div
        className={`
          bg-[#F5F9FA] 
          rounded-2xl 
          flex 
          flex-col 
          h-[calc(100vh-48px)]
          sticky
          top-6
          overflow-hidden
          ${className}
        `}
      >
        <FilterContent
          tempFilters={tempFilters}
          setTempFilters={setTempFilters}
          handleReset={handleReset}
          handleApply={handleApply}
          tempFilteredCount={tempFilteredCount}
          stickyFooter={false}
          displayMode={displayMode}
        />
      </div>
    );
  }
 
  /* ---------------------------- Drawer Mode (unchanged) ------------------ */
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          />
 
          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-[450px] bg-[#F5F9FA] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EFF1] bg-white">
              <h2 className="text-xl font-bold text-text-secondary">
                Filters
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-[#7D8D93] hover:bg-gray-100 hover:text-text-secondary transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
 
            <FilterContent
              tempFilters={tempFilters}
              setTempFilters={setTempFilters}
              handleReset={handleReset}
              handleApply={handleApply}
              tempFilteredCount={tempFilteredCount}
              stickyFooter
              displayMode={displayMode}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
 
export default FilterDrawer;