import emptyIllustration from "../../assets/empty-state-illustration.svg";

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = "No added Villages yet.",
}: EmptyStateProps) {
  return (
    <div className="flex items-center gap-6">
      {/* Illustration */}
      <div className="shrink-0 w-[142px] h-[145px] overflow-hidden">
        <img
          src={emptyIllustration}
          alt="No data illustration"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Message */}
      <p className="text-[#464646] text-[19px] font-medium leading-none whitespace-nowrap">
        {message}
      </p>
    </div>
  );
}
