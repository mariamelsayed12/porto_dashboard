import { FiTrash2, FiArrowUpRight } from "react-icons/fi";
import type { IVillage } from "../../../app/services/crudVillage";
import Button from "./Button";
import PenIcon from "../../icons/pen";
import defualtImage from "../../assets/default.png";

interface VillageCardProps {
  village: IVillage;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export default function VillageCard({
  village,
  onEdit,
  onDelete,
  onViewDetails,
}: VillageCardProps) {
  const { _id, name, developerName, startingPrice, rentalYield, coverImage, slug } = village;

  return (
    <div className="bg-white flex flex-col gap-[24px] items-end justify-center p-[16px] rounded-[20px] shadow-[0px_2px_6.3px_1px_rgba(0,0,0,0.14)] w-full">
      {/* Inner content wrapper: image + text block */}
      <div className="flex flex-col gap-[16px] items-start w-full">
        {/* Village Image */}
        <div className="h-[158px] rounded-[4px] w-full overflow-hidden shrink-0">
          <img
            src={coverImage || defualtImage}
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
              {developerName}
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
                {startingPrice ? `${startingPrice.toLocaleString()} EGP` : "N/A"}
              </p>
            </div>

            {/* Rental Yield */}
            {rentalYield !== undefined && (
              <div className="flex flex-col gap-[4px] items-start">
                <p className="text-[16px] text-[#464646] leading-none">
                  Rental Yield
                </p>
                <p className="font-medium text-[19px] text-[#141414] leading-none">
                  {rentalYield}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex gap-[20px] items-center w-full justify-between">
        <div className="flex gap-[8px] items-center">
          {/* Delete button */}
          <Button
            variant={"icon"}
            onClick={() => onDelete?.(_id)}
            className="flex items-center justify-center p-[8px] rounded-[12px] size-[36px] shrink-0 text-[#D7110E] hover:bg-red-50 transition-colors active:scale-95"
            title="Delete Village"
            aria-label="Delete village"
          >
            <FiTrash2 className="w-[24px] h-[24px]" />
          </Button>

          {/* Edit button */}
          <Button
            variant={"icon"}
            onClick={() => onEdit?.(_id)}
            className="flex items-center justify-center size-[36px] shrink-0 text-[#464646] hover:text-[#141414] transition-colors active:scale-95"
            title="Edit Village"
            aria-label="Edit village"
          >
            <PenIcon className="w-[30px] h-[30px]" />
          </Button>
        </div>

        {/* View Details button */}
        <Button
          variant="outlinePrimary"
          rightIcon={<FiArrowUpRight className="w-[20px] h-[20px] shrink-0" />}
          onClick={() => onViewDetails?.(slug || _id)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
