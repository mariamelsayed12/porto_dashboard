import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import VillageCard from "../components/Ui/VillageCard";
import EmptyState from "../components/Ui/EmptyState";
import CreateModal from "../components/Ui/CreateModal";
import DeleteModal from "../components/Ui/DeleteModal";
import { villageFormFields, mockVillages } from "../data";
import type { Village } from "../interface/village";

// import portoMarinaImg from "../assets/porto_marina.png";
// import portoMountainImg from "../assets/porto_mountain.png";

// Mock villages data – replace with API response later


const VillagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [villagesList, setVillagesList] = useState<Village[]>(mockVillages);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState<Village | null>(null);

  const { isCreateOpen, setIsCreateOpen } = useOutletContext<{
    isCreateOpen: boolean;
    setIsCreateOpen: (open: boolean) => void;
  }>();

  // Filter villages by name (ready for API integration)
  const filteredVillages = useMemo(
    () =>
      villagesList.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, villagesList]
  );

  const handleEdit = (id: string | number) => {
    console.log("Edit village:", id);
  };

  const handleDelete = (id: string | number) => {
    const village = villagesList.find((v) => v.id === id) || null;
    setVillageToDelete(village);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (villageToDelete) {
      setVillagesList((prev) => prev.filter((v) => v.id !== villageToDelete.id));
      setIsDeleteOpen(false);
      setVillageToDelete(null);
    }
  };

  const handleViewDetails = (id: string | number) => {
    console.log("View details for village:", id);
  };

  const handleCreateSubmit = (data: Record<string, any>) => {
    console.log("Created Village Form Data Submitted:", data);
    alert(`Success! Check console for submitted Village Form Data.`);
    setIsCreateOpen(false);
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
        <div className="flex items-center justify-center py-16">
          <EmptyState
            message={
              searchQuery
                ? `No villages found for "${searchQuery}".`
                : "No added Villages yet."
            }
          />
        </div>
      )}

      {/* Reusable Create Village Modal / Slider Drawer */}
      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Village"
        fields={villageFormFields}
        onSubmit={handleCreateSubmit}
        submitText="Create"
        cancelText="Cancel"
      />

      {/* Reusable Delete Village Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setVillageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this village ?"
        entityName={villageToDelete?.name}
        entitySubText={villageToDelete?.developer}
        entityImage={villageToDelete?.image}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default VillagesPage;