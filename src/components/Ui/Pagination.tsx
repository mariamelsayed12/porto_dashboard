import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when a page button is clicked */
  onPageChange: (page: number) => void;
  /** Max page buttons to show (excluding Prev/Next). Default: 5 */
  maxVisible?: number;
}

// ─── Helper: generate visible page numbers ────────────────────────────────────

function getPageRange(current: number, total: number, max: number): (number | "...")[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor((max - 2) / 2); // pages on each side of current (excluding first/last)
  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  const rangeStart = Math.max(2, current - half);
  const rangeEnd = Math.min(total - 1, current + half);

  if (rangeStart > 2) pages.push("...");

  for (let p = rangeStart; p <= rangeEnd; p++) {
    pages.push(p);
  }

  if (rangeEnd < total - 1) pages.push("...");

  // Always show last page
  pages.push(total);

  return pages;
}

// ─── Pagination Component ─────────────────────────────────────────────────────

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisible = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages, maxVisible);

  return (
    <div className="flex items-center gap-[8px]">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center gap-[6px] h-10 px-[14px] rounded-md border border-border
                   font-poppins font-normal text-[14px] text-text-darker
                   hover:bg-light-primary hover:border-primary hover:text-primary
                   disabled:opacity-40 disabled:pointer-events-none
                   transition-colors duration-150 select-none"
      >
        <FiChevronLeft size={16} />
        <span>Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-[4px]">
        {pages.map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="flex items-center justify-center w-10 h-10 font-poppins text-[14px] text-text-darker select-none"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={`
                flex items-center justify-center w-10 h-10 rounded-md
                font-poppins font-normal text-[14px]
                transition-colors duration-150 select-none
                ${
                  currentPage === page
                    ? "bg-primary text-white font-medium"
                    : "text-text-darker hover:bg-light-primary hover:text-primary border border-transparent hover:border-border"
                }
              `}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center gap-[6px] h-10 px-[14px] rounded-md border border-border
                   font-poppins font-normal text-[14px] text-text-darker
                   hover:bg-light-primary hover:border-primary hover:text-primary
                   disabled:opacity-40 disabled:pointer-events-none
                   transition-colors duration-150 select-none"
      >
        <span>Next</span>
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}
