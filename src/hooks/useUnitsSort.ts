import { useState, useMemo } from "react";
import type { Property } from "../interface";


export type SortOption =
  | "max-price"
  | "min-price"
  | "ready-by"
  | "min-installments"
  | "max-installments"
  | "";

export const useUnitsSort = (units: Property[]) => {
  const [activeSort, setActiveSort] = useState<SortOption>("");

  const sortedUnits = useMemo(() => {
    if (!activeSort) return units;

    // Create a copy to avoid mutating the original array
    const sorted = [...units];

    const getPrice = (unit: Property) =>
   
      parseFloat((unit.price || "").replace(/[^0-9.]/g, "")) || 0;

    const getDeliveryYear = (unit: Property) => {
      const deliveryBadge = unit.listingType;
      if (!deliveryBadge) return 0; // ready units are 0
      const match = deliveryBadge.match(/delivery in (\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    };

    const getMonthlyInstallment = (unit: Property) => {
      const note = (unit.downPayment || "").toLowerCase();
      if (note.includes("full cash payment")) {
        return 0;
      }
      const qtMatch = note.match(/([\d,]+)\s*quarterly/i);
      if (qtMatch) {
        return parseFloat(qtMatch[1].replace(/,/g, "")) / 3;
      }
      return 0;
    };

    sorted.sort((a, b) => {
      switch (activeSort) {
        case "max-price":
          return getPrice(b) - getPrice(a);
        case "min-price":
          return getPrice(a) - getPrice(b);
        case "ready-by":
          return getDeliveryYear(a) - getDeliveryYear(b);
        case "min-installments":
          return getMonthlyInstallment(a) - getMonthlyInstallment(b);
        case "max-installments":
          return getMonthlyInstallment(b) - getMonthlyInstallment(a);
        default:
          return 0;
      }
    });

    return sorted;
  }, [units, activeSort]);

  return {
    activeSort,
    setActiveSort,
    sortedUnits,
  };
};
