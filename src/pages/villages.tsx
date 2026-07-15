import { useState, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import VillageCard from "../components/Ui/VillageCard";
import EmptyState from "../components/Ui/EmptyState";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import { villageFormFields, mockVillages } from "../data";
import type { Village } from "../interface/index";
import defualtImage from "../assets/default.png";

const VillagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [villagesList, setVillagesList] = useState<Village[]>(() => {
    const saved = localStorage.getItem("porto_villages");
    return saved ? JSON.parse(saved) : mockVillages;
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState<Village | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [villageToEdit, setVillageToEdit] = useState<Village | null>(null);

  const { isCreateOpen, setIsCreateOpen } = useOutletContext<{
    isCreateOpen: boolean;
    setIsCreateOpen: (open: boolean) => void;
  }>();

  // Filter villages by name
  const filteredVillages = useMemo(
    () =>
      villagesList.filter((v) =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, villagesList]
  );

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
    const coverImage = data.media?.cover || villageToEdit.image;

    const updated = villagesList.map((v) =>
      v.id === villageToEdit.id
        ? {
            ...v,
            name: data.name,
            developer: data.developer,
            startingPrice: data.price || v.startingPrice,
            image: coverImage,
          }
        : v
    );

    setVillagesList(updated);
    localStorage.setItem("porto_villages", JSON.stringify(updated));
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
      const updated = villagesList.filter((v) => v.id !== villageToDelete.id);
      setVillagesList(updated);
      localStorage.setItem("porto_villages", JSON.stringify(updated));
      setIsDeleteOpen(false);
      setVillageToDelete(null);
    }
  };

  const handleViewDetails = (id: string | number) => {
    navigate(`/villages/${id}`);
  };

  const handleCreateSubmit = (data: Record<string, any>) => {
    const newId = Date.now();
    const coverImage = data.media?.cover || defualtImage;

    const newVillage: Village = {
      id: newId,
      name: data.name,
      developer: data.developer,
      startingPrice: data.price || "1M",
      availableProperties: 10,
      image: coverImage,
      location: data.location,
      amenities: data.amenities,
    };

    const updated = [newVillage, ...villagesList];
    setVillagesList(updated);
    localStorage.setItem("porto_villages", JSON.stringify(updated));
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