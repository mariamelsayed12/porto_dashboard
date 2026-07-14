import type { ElementType } from "react";

interface QuickActionProps {
  title: string;
  description: string;
  Icon: ElementType;
  onClick?: () => void;
  iconColor?: string;
}

export default function QuickAction({ title, description, Icon, onClick, iconColor = "text-primary" }: QuickActionProps) {
  return (
    <div
      onClick={onClick}
      className="bg-light-primary border border-border flex items-start gap-4 p-6 rounded-md w-full transition-all duration-200 hover:bg-[#dcebf0] hover:shadow-sm cursor-pointer"
    >
      <div className={`shrink-0 w-10 h-10 flex items-center justify-center ${iconColor}`}>
        <Icon className="w-full h-full object-contain" />
      </div>
      <div className="flex flex-col gap-1.5 justify-center">
        <h4 className="font-medium text-[19px] text-text-secondary leading-none">
          {title}
        </h4>
        <p className="font-normal text-[16px] text-text-darker leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
}
