import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import VillageCard from "../components/Ui/VillageCard";
import EmptyState from "../components/Ui/EmptyState";
import FormDrawer from "../components/Ui/FormDrawer";
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

  // Edit form states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [villageToEdit, setVillageToEdit] = useState<Village | null>(null);

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

  // Generate edit form fields config pre-populated with active village data
  const editFormFields = useMemo(() => {
    if (!villageToEdit) return [];
    return [
      {
        name: "name",
        label: "Village name",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: villageToEdit.name,
      },
      {
        name: "developer",
        label: "Developer name",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: villageToEdit.developer,
      },
      {
        type: "divider" as const,
        name: "div-1",
      },
      {
        name: "price",
        label: "Starting price",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: villageToEdit.startingPrice,
      },
      {
        name: "rentalYield",
        label: "Rental yield",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: "7.5%",
      },
      {
        type: "divider" as const,
        name: "div-2",
      },
      {
        name: "amenities",
        label: "Amenities",
        type: "multiselect" as const,
        placeholder: "Select amenities",
        required: true,
        options: [
          { label: "Pool", value: "pool" },
          { label: "Gym", value: "gym" },
          { label: "Beach", value: "beach" },
          { label: "Security", value: "security" },
          { label: "Parking", value: "parking" },
          { label: "Restaurant", value: "restaurant" },
          { label: "Kids Area", value: "kids" },
        ],
        defaultValue: ["pool", "gym", "beach", "security", "parking"],
      },
      {
        type: "divider" as const,
        name: "div-3",
      },
      {
        name: "media",
        label: "Media",
        type: "image-upload" as const,
        required: true,
        defaultValue: {
          cover: villageToEdit.image || null,
          images: [null, null, null, null],
        },
      },
      {
        type: "divider" as const,
        name: "div-4",
      },
      {
        name: "location",
        label: "Location",
        type: "location" as const,
        required: true,
        defaultValue: "760 Market Street, San Francisco, CA 94107",
      },
    ];
  }, [villageToEdit]);

  const handleEdit = (id: string | number) => {
    const village = villagesList.find((v) => v.id === id) || null;
    setVillageToEdit(village);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    if (!villageToEdit) return;
    
    // Extract cover image if customized
    const coverImage = data.media?.cover || villageToEdit.image;

    // Update village in state list
    setVillagesList((prev) =>
      prev.map((v) =>
        v.id === villageToEdit.id
          ? {
              ...v,
              name: data.name,
              developer: data.developer,
              startingPrice: data.price || v.startingPrice,
              image: coverImage,
            }
          : v
      )
    );

    console.log("Updated Village Form Data Submitted:", data);
    alert(`Success! Village updated.`);
    setIsEditOpen(false);
    setVillageToEdit(null);
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
    
    // Add to list locally with fake properties count and cover image
    const newId = Date.now();
    const coverImage = data.media?.cover || "http://localhost:3845/assets/4274e9f7980d4c5c804c931250ac5d0b40b1c7fa.png";
    
    const newVillage: Village = {
      id: newId,
      name: data.name,
      developer: data.developer,
      startingPrice: data.price || "1M",
      availableProperties: 10,
      image: coverImage,
    };
    
    setVillagesList((prev) => [newVillage, ...prev]);
    alert(`Success! Village created.`);
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

      {/* Reusable Create Village Drawer */}
      <FormDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Village"
        fields={villageFormFields}
        onSubmit={handleCreateSubmit}
        submitText="Create"
        cancelText="Cancel"
      />

      {/* Reusable Edit Village Drawer */}
      <FormDrawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setVillageToEdit(null);
        }}
        title="Edit Village"
        fields={editFormFields}
        onSubmit={handleEditSubmit}
        submitText="Save Changes"
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