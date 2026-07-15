import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Called when a page button is clicked */
  onPageChange: (page: number) => void;
  /** Max visible page numbers (excluding Prev/Next). Default: 5 */
  maxVisible?: number;
}

// ─── Helper: generate page range with ellipsis ───────────────────────────────

function getPageRange(
  current: number,
  total: number,
  max: number
): (number | "...")[] {
  if (total <= max) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const half = Math.floor((max - 2) / 2);
  const pages: (number | "...")[] = [];

  pages.push(1);

  const rangeStart = Math.max(2, current - half);
  const rangeEnd = Math.min(total - 1, current + half);

  if (rangeStart > 2) pages.push("...");
  for (let p = rangeStart; p <= rangeEnd; p++) pages.push(p);
  if (rangeEnd < total - 1) pages.push("...");

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
    <div className="flex items-center gap-[8px] flex-wrap">

      {/* ── Previous Button ─────────────────────────────────────────────── */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={`
          flex items-center gap-[6px] h-10 px-[14px]
          font-poppins font-normal text-[16px] leading-[100%]
          rounded-md select-none transition-colors duration-150
          disabled:opacity-40 disabled:pointer-events-none
          ${currentPage === 1
            ? "text-[#464646]"
            : "text-[#464646] hover:text-primary hover:bg-light-primary"
          }
        `}
      >
        <FiChevronLeft size={18} strokeWidth={2} />
        <span className="hidden xs:inline sm:inline">Previous</span>
      </button>

      {/* ── Page Numbers ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-[4px]">
        {pages.map((page, idx) =>
          page === "..." ? (
            // Ellipsis gap — matches Figma "Pagination Gap" node (47px wide)
            <span
              key={`gap-${idx}`}
              className="flex items-center justify-center w-[47px] h-10 font-poppins text-[16px] text-[#464646] select-none pointer-events-none"
            >
              ...
            </span>
          ) : (
            // Page pill — active gets bg-primary (#1E8CAB) fill, inactive is transparent
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={`
                flex items-center justify-center min-w-[32px] h-10 px-[6px]
                font-poppins font-normal text-[16px] leading-[100%]
                rounded-md select-none transition-colors duration-150
                ${currentPage === page
                  ? "bg-primary text-[#F5F9FA] font-medium"
                  : "text-[#464646] hover:bg-light-primary hover:text-primary"
                }
              `}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* ── Next Button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={`
          flex items-center gap-[6px] h-10 px-[14px]
          font-poppins font-normal text-[16px] leading-[100%]
          rounded-md select-none transition-colors duration-150
          disabled:opacity-40 disabled:pointer-events-none
          ${currentPage === totalPages
            ? "text-[#464646]"
            : "text-[#464646] hover:text-primary hover:bg-light-primary"
          }
        `}
      >
        <span className="hidden xs:inline sm:inline">Next</span>
        <FiChevronRight size={18} strokeWidth={2} />
      </button>

    </div>
  );
}
