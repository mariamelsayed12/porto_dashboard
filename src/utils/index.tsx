export const truncateText = (text: string, maxLength: number = 10) => {
  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}...`;
};



// ─── Status badge helper ──────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-successGreen text-text-secondary",
    "available soon": "bg-warning text-text-secondary",
    pending: "bg-[#fcf8eb] text-text-secondary",
    "sold out": "bg-brandBlue text-text-secondary",
    rented: "bg-brandBlue text-text-secondary",
    "not available": "bg-errorRed text-text-secondary",
  };
  const cls = styles[status.toLowerCase()] ?? "bg-light-gray text-text-darker";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-[13px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  )
}
