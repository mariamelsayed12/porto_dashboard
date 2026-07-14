import type { ElementType } from "react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  Icon: ElementType;
  iconColor?: string;
}

export default function KpiCard({ title, value, subtext, Icon, iconColor = "text-text-darker" }: KpiCardProps) {
  return (
    <div className="bg-white border border-border h-[163px] flex flex-col justify-between p-6 rounded-md transition-shadow hover:shadow-sm">
      <div className="flex items-center gap-2">
        <div className={`shrink-0 w-8 h-8 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-full h-full object-contain" />
        </div>
        <h3 className="font-medium text-[19px] text-text-darker leading-none">
          {title}
        </h3>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <span className="font-semibold text-[23px] text-text-secondary leading-none">
          {value}
        </span>
        {subtext ? (
          <span className="font-normal text-[16px] text-text-darker leading-none mt-1">
            {subtext}
          </span>
        ) : (
          <span className="font-normal text-[16px] text-transparent leading-none mt-1 select-none">
            Placeholder
          </span>
        )}
      </div>
    </div>
  );
}
