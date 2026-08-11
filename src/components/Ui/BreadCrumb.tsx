import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = "" }: BreadcrumbProps) => {
  return (
    <nav
      className={`flex items-center flex-wrap gap-y-1 gap-x-1.5 md:gap-x-2.5 font-poppins text-[15px] md:text-[23px] leading-none min-w-0 ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label} className="flex items-center min-w-0 shrink-0">
            {/* Separator / */}
            {index > 0 && (
              <span className="text-text-naturalGray font-medium mr-1.5 md:mr-2.5 select-none shrink-0">
                /
              </span>
            )}

            {/* Breadcrumb Item */}
            {isLast ? (
              <span
                className="font-semibold text-text-secondary truncate max-w-[120px] sm:max-w-[200px] md:max-w-none block"
                title={item.label}
              >
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                onClick={item.onClick}
                className="font-medium text-text-naturalGray hover:text-primary transition-colors truncate max-w-[100px] sm:max-w-[150px] md:max-w-none block"
                title={item.label}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="font-medium text-text-secondary truncate max-w-[100px] sm:max-w-[150px] md:max-w-none block"
                title={item.label}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
export { Breadcrumb };
