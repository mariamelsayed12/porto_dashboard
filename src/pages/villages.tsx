import { useState, useMemo } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import VillageCard from "../components/Ui/VillageCard";
import Button from "../components/Ui/Button";
import type { Village } from "../interface/village";

import portoGolfImg from "../assets/porto_golf.png";
import portoMarinaImg from "../assets/porto_marina.png";
import portoMountainImg from "../assets/porto_mountain.png";

// Mock villages data – replace with API response later
const mockVillages: Village[] = [
  {
    id: 1,
    name: "Porto Golf",
    developer: "Amer group",
    startingPrice: "2M",
    availableProperties: 24,
    image: portoGolfImg,
  },
  {
    id: 2,
    name: "Porto Marina",
    developer: "Amer group",
    startingPrice: "3.5M",
    availableProperties: 18,
    image: portoMarinaImg,
  },
  {
    id: 3,
    name: "Porto Heliopolis",
    developer: "Amer group",
    startingPrice: "1.8M",
    availableProperties: 31,
    image: portoMountainImg,
  },
  {
    id: 4,
    name: "Porto New Cairo",
    developer: "Amer group",
    startingPrice: "2.7M",
    availableProperties: 12,
    image: portoGolfImg,
  },
  {
    id: 5,
    name: "Porto October",
    developer: "Amer group",
    startingPrice: "1.5M",
    availableProperties: 40,
    image: portoMarinaImg,
  },
  {
    id: 6,
    name: "Porto South",
    developer: "Amer group",
    startingPrice: "2.2M",
    availableProperties: 9,
    image: portoMountainImg,
  },
];

const VillagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter villages by name (ready for API integration)
  const filteredVillages = useMemo(
    () =>
      mockVillages.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const handleEdit = (id: string | number) => {
    console.log("Edit village:", id);
  };

  const handleDelete = (id: string | number) => {
    console.log("Delete village:", id);
  };

  const handleViewDetails = (id: string | number) => {
    console.log("View details for village:", id);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex items-center w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 w-[18px] h-[18px] text-text-naturalGray pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search villages..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-white text-text-secondary placeholder:text-text-naturalGray focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
          />
        </div>

        {/* Add Village Button */}
        <Button
          variant="create"
          leftIcon={<FiPlus className="w-4 h-4" />}
          onClick={() => console.log("Add Village clicked")}
          className="shrink-0 w-full sm:w-auto"
        >
          Add Village
        </Button>
      </div>

      {/* Villages Grid */}
      {filteredVillages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVillages.map((village) => (
            <VillageCard
              key={village.id}
              village={village}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FiSearch className="w-10 h-10 text-text-naturalGray mb-4 opacity-40" />
          <p className="text-text-darker font-medium text-base">No villages found</p>
          <p className="text-text-naturalGray text-sm mt-1">
            Try adjusting your search term.
          </p>
        </div>
      )}
    </div>
  );
};

export default VillagesPage;