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
      className={`flex items-center flex-wrap gap-x-1.5 sm:gap-x-2.5 font-poppins text-[18px] sm:text-[23px] leading-none ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={item.label} className="flex items-center">
            {/* Separator / */}
            {index > 0 && (
              <span className="text-text-naturalGray font-medium mr-1.5 sm:mr-2.5 select-none">
                /
              </span>
            )}

            {/* Breadcrumb Item */}
            {isLast ? (
              <span className="font-semibold text-text-secondary">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                onClick={item.onClick}
                className="font-medium text-text-naturalGray hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-text-secondary">
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
