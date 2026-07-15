import { useState, useMemo, useCallback } from "react";

export interface FilterState {
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  areaFrom: string;
  areaTo: string;
  priceFrom: string;
  priceTo: string;
  downPayment: string;
  monthlyInstallment: string;
  deliveryDate: string;
  finishing: string;
  location?: string;
}

export const initialFilterState: FilterState = {
  propertyType: "",
  bedrooms: "",
  bathrooms: "",
  areaFrom: "",
  areaTo: "",
  priceFrom: "",
  priceTo: "",
  downPayment: "",
  monthlyInstallment: "",
  deliveryDate: "",
  finishing: "",
  location: "",
};

// Deterministic finishing assignment since mock data doesn't have a finishing field
export const getFinishingForUnit = (unitId: number| string): string => {
  const strId = String(unitId);
  let hash = 0;
  for (let i = 0; i < strId.length; i++) {
    hash = strId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 4;
  const finishingTypes = [
    "Not finished",
    "Semi finished",
    "Finished",
    "Fully furnished",
  ];
  return finishingTypes[index];
};

// Helper function to check if a unit matches a set of filters
export const matchUnit = (
  unit: Property,
  filterState: FilterState,
): boolean => {
  // 1. Property Type Filter
  if (filterState.propertyType) {
    const parts = (unit.location || "").split("•");
    const unitType = parts.length > 1 ? parts[1].trim().toLowerCase() : "";
    const selectedTypes = filterState.propertyType.split(",").map(t => t.trim().toLowerCase());

    const isChalet = (t: string) =>
      t === "chalet" || t === "challet" || t === "chalets" || t === "challets";

    let matchesType = false;
    for (const targetType of selectedTypes) {
      if (isChalet(targetType)) {
        if (isChalet(unitType)) matchesType = true;
      } else if (targetType === "twin house" || targetType === "twinhouse") {
        if (
          unitType === "twin house" ||
          unitType === "townhouse" ||
          unitType === "town house"
        ) {
          matchesType = true;
        }
      } else if (targetType === "apartment") {
        if (
          unitType === "apartment" ||
          unitType === "studio" ||
          unitType === "penthouse"
        ) {
          matchesType = true;
        }
      } else {
        if (unitType === targetType) matchesType = true;
      }
    }

    if (!matchesType) return false;
  }

  // 2. Bedrooms Filter
  if (filterState.bedrooms) {
    const bedStat = unit.stats?.find((s) => s.icon === "bed");
    if (!bedStat) return false;
    const bedValue = parseInt(bedStat.value, 10);

    if (filterState.bedrooms === "5+") {
      if (bedValue < 5) return false;
    } else {
      const targetBeds = parseInt(filterState.bedrooms, 10);
      if (bedValue !== targetBeds) return false;
    }
  }

  // 3. Bathrooms Filter
  if (filterState.bathrooms) {
    const bathStat = unit.stats?.find((s) => s.icon === "bath");
    if (!bathStat) return false;
    const bathValue = parseFloat(bathStat.value);

    if (filterState.bathrooms === "3+") {
      if (bathValue < 3) return false;
    } else {
      const targetBaths = parseFloat(filterState.bathrooms);
      if (bathValue < targetBaths) return false;
    }
  }

  // 4. Area Range Filter
  const areaStat = unit.stats?.find((s) => s.icon === "area");
  const areaValue = areaStat ? parseFloat(areaStat.value) : NaN;
  if (filterState.areaFrom) {
    if (isNaN(areaValue) || areaValue < parseFloat(filterState.areaFrom))
      return false;
  }
  if (filterState.areaTo) {
    if (isNaN(areaValue) || areaValue > parseFloat(filterState.areaTo))
      return false;
  }

  // 5. Price Range Filter
  const priceValue = parseFloat((unit.price || "").replace(/[^0-9.]/g, ""));
  if (filterState.priceFrom) {
    if (isNaN(priceValue) || priceValue < parseFloat(filterState.priceFrom))
      return false;
  }
  if (filterState.priceTo) {
    if (isNaN(priceValue) || priceValue > parseFloat(filterState.priceTo))
      return false;
  }

  // 6. Payments Filter (Down Payment & Monthly Installment)
  let unitDownPayment = 0;
  let unitMonthlyInstallment = 0;

  if (!isNaN(priceValue)) {
    const note = (unit.downPayment || "").toLowerCase();
    if (note.includes("full cash payment")) {
      unitDownPayment = priceValue;
      unitMonthlyInstallment = 0;
    } else {
      // Down payment percent match
      const pctMatch = note.match(/(\d+(?:\.\d+)?)\s*%\s*down/i);
      if (pctMatch) {
        const pct = parseFloat(pctMatch[1]);
        unitDownPayment = priceValue * (pct / 100);
      }

      // Installment quarterly match
      const qtMatch = note.match(/([\d,]+)\s*quarterly/i);
      if (qtMatch) {
        const qtVal = parseFloat(qtMatch[1].replace(/,/g, ""));
        unitMonthlyInstallment = qtVal / 3;
      }
    }
  }

  if (filterState.downPayment) {
    if (unitDownPayment > parseFloat(filterState.downPayment)) return false;
  }
  if (filterState.monthlyInstallment) {
    if (unitMonthlyInstallment > parseFloat(filterState.monthlyInstallment))
      return false;
  }

  // 7. Delivery Date Filter
  if (filterState.deliveryDate) {
    // Find delivery badge
    const deliveryBadge = unit.listingType;
    let deliveryYear: number | null = null;
    if (deliveryBadge) {
      const match = deliveryBadge.match(/delivery in (\d+)/i);
      if (match) {
        deliveryYear = parseInt(match[1], 10);
      }
    }

    if (filterState.deliveryDate.toLowerCase() === "ready") {
      // If there's a delivery badge and the year is in the future
      if (deliveryYear && deliveryYear > 2026) return false;
    } else {
      const targetYear = parseInt(filterState.deliveryDate, 10);
      if (deliveryYear !== targetYear) return false;
    }
  }

  // 8. Finishing Filter
  if (filterState.finishing) {
    const unitFinishing = getFinishingForUnit(unit.id);
    if (unitFinishing.toLowerCase() !== filterState.finishing.toLowerCase())
      return false;
  }

  // 9. Location Filter
  if (filterState.location) {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s-_]+/g, "");
    const selectedLocs = filterState.location.split(",").map(l => normalize(l.trim()));
    if (
      !selectedLocs.includes(normalize(unit.village || ""))
    ) {
      return false;
    }
  }

  return true;
};

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { Property } from "../interface";

export const useUnitsFilter = (units: Property[]) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse search params to FilterState
  const parseParams = useCallback((): FilterState => {
    return {
      propertyType: searchParams.get("type") || searchParams.get("propertyType") || "",
      bedrooms: searchParams.get("bedrooms") || searchParams.get("beds") || "",
      bathrooms: searchParams.get("bathrooms") || searchParams.get("baths") || "",
      areaFrom: searchParams.get("areaFrom") || "",
      areaTo: searchParams.get("areaTo") || "",
      priceFrom: searchParams.get("priceFrom") || "",
      priceTo: searchParams.get("priceTo") || "",
      downPayment: searchParams.get("downPayment") || "",
      monthlyInstallment: searchParams.get("monthlyInstallment") || "",
      deliveryDate: searchParams.get("deliveryDate") || "",
      finishing: searchParams.get("finishing") || "",
      location: searchParams.get("location") || "",
    };
  }, [searchParams]);

  // Committed filters that affect the main page
  const [filters, setFilters] = useState<FilterState>(parseParams());

  // Local/unsaved filters inside the drawer
  const [tempFilters, setTempFilters] = useState<FilterState>(parseParams());

  // Sync state when URL params change (e.g. on navigation)
  useEffect(() => {
    const parsed = parseParams();
    setFilters(parsed);
    setTempFilters(parsed);
  }, [parseParams]);

  // Memoized filtered units based on committed filters
  const filteredUnits = useMemo(() => {
    return units.filter((unit) => matchUnit(unit, filters));
  }, [units, filters]);

  // Memoized matching count based on temporary filters (for drawer count display)
  const tempFilteredCount = useMemo(() => {
    return units.filter((unit) => matchUnit(unit, tempFilters)).length;
  }, [units, tempFilters]);

  // Apply the temporary filters to committed filters and URL
  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    const params = new URLSearchParams();
    if (tempFilters.propertyType) params.set("type", tempFilters.propertyType);
    if (tempFilters.location) params.set("location", tempFilters.location);
    if (tempFilters.bedrooms) params.set("bedrooms", tempFilters.bedrooms);
    if (tempFilters.bathrooms) params.set("bathrooms", tempFilters.bathrooms);
    if (tempFilters.priceFrom) params.set("priceFrom", tempFilters.priceFrom);
    if (tempFilters.priceTo) params.set("priceTo", tempFilters.priceTo);
    setSearchParams(params, { replace: true });
  }, [tempFilters, setSearchParams]);

  // Reset both temporary and committed filters and URL
  const resetFilters = useCallback(() => {
    setFilters(initialFilterState);
    setTempFilters(initialFilterState);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    setFilters,
    tempFilters,
    setTempFilters,
    applyFilters,
    resetFilters,
    filteredUnits,
    tempFilteredCount,
  };
};

