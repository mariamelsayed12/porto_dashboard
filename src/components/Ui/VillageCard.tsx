import { FiTrash2, FiEdit2, FiArrowUpRight } from "react-icons/fi";
import type { Village } from "../../interface/village";
import Button from "./Button";
import PenIcon from "../../icons/pen";

interface VillageCardProps {
  village: Village;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onViewDetails?: (id: string | number) => void;
}

export default function VillageCard({
  village,
  onEdit,
  onDelete,
  onViewDetails,
}: VillageCardProps) {
  const { id, name, developer, startingPrice, availableProperties, image } = village;

  return (
    <div className="bg-white flex flex-col gap-[24px] items-end justify-center p-[16px] rounded-[20px] shadow-[0px_2px_6.3px_1px_rgba(0,0,0,0.14)] w-full">

      {/* Inner content wrapper: image + text block */}
      <div className="flex flex-col gap-[16px] items-start w-full">

        {/* Village Image */}
        <div className="h-[158px] rounded-[4px] w-full overflow-hidden shrink-0">
          <img
            src={image}
            alt={name}
            className="w-full h-full rounded-[4px] object-cover"
            loading="lazy"
          />
        </div>

        {/* Text block: Name row + Stats row */}
        <div className="flex flex-col gap-[12px] items-start w-full">

          {/* Name / Developer — same row */}
          <div className="flex items-center justify-between w-full gap-2">
            <p className="font-medium text-[19px] text-[#141414] leading-none truncate">
              {name}
            </p>
            <p className="text-[16px] text-[#464646] leading-none shrink-0">
              {developer}
            </p>
          </div>

          {/* Stats — same row, justify-between */}
          <div className="flex items-center justify-between w-full">
            {/* Starting price */}
            <div className="flex flex-col gap-[4px] items-start">
              <p className="text-[16px] text-[#464646] leading-none">
                Starting price
              </p>
              <p className="font-medium text-[19px] text-[#141414] leading-none">
                {startingPrice}
              </p>
            </div>

            {/* Available Properties */}
            <div className="flex flex-col gap-[4px] items-start">
              <p className="text-[16px] text-[#464646] leading-none">
                Available Properties
              </p>
              <p className="font-medium text-[19px] text-[#141414] leading-none">
                {availableProperties}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Actions Row */}
      <div className="flex gap-[20px] items-center w-full">

        {/* Delete button */}
        <Button
        variant={"icon"}
          onClick={() => onDelete?.(id)}
          className="flex items-center justify-center p-[8px] rounded-[12px] size-[36px] shrink-0 text-[#D7110E] hover:bg-red-50 transition-colors active:scale-95"
          title="Delete Village"
          aria-label="Delete village"
        >
          <FiTrash2 className="w-[24px] h-[24px]" />
        </Button>

        {/* Edit button */}
        <Button
        variant={"icon"}
          onClick={() => onEdit?.(id)}
          className="flex items-center justify-center size-[36px] shrink-0 text-[#464646] hover:text-[#141414] transition-colors active:scale-95"
          title="Edit Village"
          aria-label="Edit village"
        >
          <PenIcon className="w-[30px] h-[30px]" />
        </Button>

        {/* View Details button */}
        <Button
          variant="outlinePrimary"
          rightIcon={<FiArrowUpRight className="w-[20px] h-[20px] shrink-0" />}
          onClick={() => onViewDetails?.(id)}
        >
          View Details
        </Button>

      </div>
    </div>
  );
}
