import { useState, useMemo } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import VillageCard from "../components/Ui/VillageCard";
import EmptyState from "../components/Ui/EmptyState";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import { villageFormFields, mockVillages } from "../data";
import type { Village } from "../interface/index";
import defualtImage from "../assets/default.png";
import FilterSortSection, { type FilterConfig } from "../components/Ui/FilterSortSection";

const VillagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // ── Filter values from URL ─────────────────────────────────────────────────
  const selectedDevelopers = useMemo(() => {
    const val = searchParams.get("developer");
    return val ? val.split(",") : [];
  }, [searchParams]);

  const activeSort = useMemo(() => {
    return searchParams.get("sort") || "";
  }, [searchParams]);

  const handleFilterChange = (key: string, values: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (values.length > 0) {
      newParams.set(key, values.join(","));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSortChange = (sortVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortVal) {
      newParams.set("sort", sortVal);
    } else {
      newParams.delete("sort");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Filter villages by name and developer
  const filteredVillages = useMemo(() => {
    return villagesList.filter((v) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.developer.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedDevelopers.length > 0) {
        if (!selectedDevelopers.includes(v.developer)) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, villagesList, selectedDevelopers]);

  const sortedVillages = useMemo(() => {
    const list = [...filteredVillages];
    if (!activeSort) return list;

    const parsePrice = (priceStr: string): number => {
      const val = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
      return isNaN(val) ? 0 : val;
    };

    list.sort((a, b) => {
      if (activeSort === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (activeSort === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (activeSort === "price-asc") {
        return parsePrice(a.startingPrice) - parsePrice(b.startingPrice);
      }
      if (activeSort === "price-desc") {
        return parsePrice(b.startingPrice) - parsePrice(a.startingPrice);
      }
      return 0;
    });
    return list;
  }, [filteredVillages, activeSort]);

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

  const developerOptions = useMemo(() => {
    const developers = Array.from(new Set(villagesList.map((v) => v.developer)));
    return developers.map((dev) => ({ label: dev, value: dev }));
  }, [villagesList]);

  const filterConfigs: FilterConfig[] = [
    {
      id: "developer",
      label: "Developer",
      options: developerOptions,
      value: selectedDevelopers,
      onChange: (vals) => handleFilterChange("developer", vals),
    },
  ];

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Name (Z-A)", value: "name-desc" },
    { label: "Price (Low to High)", value: "price-asc" },
    { label: "Price (High to Low)", value: "price-desc" },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Toolbar */}
      <FilterSortSection
        searchPlaceholder="Search villages..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filterConfigs}
        sortOptions={sortOptions}
        activeSortValue={activeSort}
        onSortChange={handleSortChange}
      />

      {/* Villages Grid */}
      {sortedVillages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedVillages.map((village) => (
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