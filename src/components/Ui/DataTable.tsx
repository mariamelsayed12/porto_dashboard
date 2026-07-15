import { type ReactNode } from "react";
import EmptyState from "./EmptyState";

// ─── Column Definition ──────────────────────────────────────────────────────

export interface ColumnDef<TRow = Record<string, unknown>> {
  /** Unique key mapping to a row field (or use `render` for computed columns) */
  key: string;
  /** Header label shown in <thead> */
  label: string;
  /** Optional width class, e.g. "w-[15%]" */
  width?: string;
  /** Horizontal text alignment for both header and cells */
  align?: "left" | "center" | "right";
  /** Custom cell renderer — receives the row and its value */
  render?: (value: unknown, row: TRow) => ReactNode;
}

// ─── Action Definition ───────────────────────────────────────────────────────

export interface ActionDef<TRow = Record<string, unknown>> {
  /** Unique key for this action */
  key: string;
  /** Accessible label for the button */
  label: string;
  /** Icon to render inside the button */
  icon: ReactNode;
  /** Called when the user clicks this action */
  onClick: (row: TRow) => void;
  /** Optional: hide this action based on row data */
  hidden?: (row: TRow) => boolean;
  /** Optional extra class names for the button */
  className?: string;
}

// ─── DataTable Props ─────────────────────────────────────────────────────────

export interface DataTableProps<TRow extends { id: string | number }> {
  /** Column definitions */
  columns: ColumnDef<TRow>[];
  /** Row data array */
  data: TRow[];
  /** Row-level action buttons rendered in a trailing column */
  actions?: ActionDef<TRow>[];
  /** Whether data is still loading */
  isLoading?: boolean;
  /** Number of skeleton rows while loading */
  loadingRows?: number;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Optional: callback when a row is clicked */
  onRowClick?: (row: TRow) => void;
  /** Optional extra class on the wrapper div */
  className?: string;
  /** Optional: minimum table width for horizontal scroll */
  minWidth?: string;
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="border-b border-border animate-pulse">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div className="h-4 bg-[#EDEFF2] rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ─── Align helper ────────────────────────────────────────────────────────────

const alignClass = (align?: "left" | "center" | "right") => {
  switch (align) {
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
};

// ─── DataTable Component ──────────────────────────────────────────────────────

export default function DataTable<TRow extends { id: string | number }>({
  columns,
  data,
  actions,
  isLoading = false,
  loadingRows = 5,
  emptyMessage,
  onRowClick,
  className = "",
  minWidth = "700px",
}: DataTableProps<TRow>) {
  const hasActions = actions && actions.length > 0;
  const totalCols = columns.length + (hasActions ? 1 : 0);

  return (
    <div
      className={`w-full flex flex-col rounded-md border border-border overflow-hidden bg-white ${className}`}
    >
      {/* Horizontal scroll wrapper */}
      <div className="w-full overflow-x-auto">
        <table
          className="w-full border-collapse"
          style={{ minWidth }}
        >
          {/* ── Head ─────────────────────────────────────────────────── */}
          <thead>
            <tr className="bg-light-primary border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-[14px] px-4 font-poppins font-medium text-[14px] text-text-darker ${alignClass(col.align)} ${col.width ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="py-[14px] px-4 text-right font-poppins font-medium text-[14px] text-text-darker w-[120px]">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* ── Body ─────────────────────────────────────────────────── */}
          <tbody className="divide-y divide-border">
            {/* Loading state */}
            {isLoading &&
              Array.from({ length: loadingRows }).map((_, i) => (
                <SkeletonRow key={i} colCount={totalCols} />
              ))}

            {/* Data rows */}
            {!isLoading &&
              data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={`group transition-colors duration-150 hover:bg-[#F5F9FA] ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col) => {
                    const value = (row as Record<string, unknown>)[col.key];
                    return (
                      <td
                        key={col.key}
                        className={`py-4 px-4 font-poppins font-normal text-[14px] text-text-secondary ${alignClass(col.align)}`}
                      >
                        {col.render ? col.render(value, row) : (value as ReactNode)}
                      </td>
                    );
                  })}

                  {/* Action buttons */}
                  {hasActions && (
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions!.map((action) => {
                          if (action.hidden?.(row)) return null;
                          return (
                            <button
                              key={action.key}
                              title={action.label}
                              aria-label={action.label}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={`flex items-center justify-center w-8 h-8 rounded-md text-text-darker hover:text-primary hover:bg-light-primary transition-colors duration-150 ${action.className ?? ""}`}
                            >
                              {action.icon}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

            {/* Empty state */}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={totalCols} className="py-16 px-4">
                  <div className="flex items-center justify-center">
                    <EmptyState message={emptyMessage ?? "No data available."} />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
