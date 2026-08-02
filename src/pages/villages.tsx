import { useState, useMemo } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import VillageCard from "../components/Ui/VillageCard";
import EmptyState from "../components/Ui/EmptyState";
import DeleteModal from "../components/Ui/DeleteModal";
import EditVillageDrawer from "../components/Villages/EditVillageDrawer";
import CreateVillageDrawer from "../components/Villages/CreateVillageDrawer";
import VillagesSkeleton from "../components/Villages/VillagesSkeleton";
import FilterSortSection, { type FilterConfig } from "../components/Ui/FilterSortSection";
import { showSuccessToast, showErrorToast } from "../components/Ui/Toast";
import {
  useGetVillageQuery,
  useCreateVillageMutation,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
  type IVillage,
} from "../../app/services/crudVillage";

const VillagesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: villages, isLoading, isError } = useGetVillageQuery();
  
  const [createVillage, { isLoading: isCreating }] = useCreateVillageMutation();
  const [updateVillage, { isLoading: isUpdating }] = useUpdateVillageMutation();
  const [deleteVillage, { isLoading: isDeleting }] = useDeleteVillageMutation();

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [villageToDelete, setVillageToDelete] = useState<IVillage | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [villageToEdit, setVillageToEdit] = useState<IVillage | null>(null);

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

  // Filter villages by name and developerName
  const filteredVillages = useMemo(() => {
    if (!villages) return [];
    return villages.filter((v) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!v.name.toLowerCase().includes(q) && !v.developerName.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedDevelopers.length > 0) {
        if (!selectedDevelopers.includes(v.developerName)) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, villages, selectedDevelopers]);

  // Sort villages dynamically
  const sortedVillages = useMemo(() => {
    const list = [...filteredVillages];
    if (!activeSort) return list;

    list.sort((a, b) => {
      if (activeSort === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (activeSort === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      if (activeSort === "price-asc") {
        return (a.startingPrice || 0) - (b.startingPrice || 0);
      }
      if (activeSort === "price-desc") {
        return (b.startingPrice || 0) - (a.startingPrice || 0);
      }
      return 0;
    });
    return list;
  }, [filteredVillages, activeSort]);

  const handleEdit = (id: string) => {
    const village = villages?.find((v) => v._id === id) || null;
    setVillageToEdit(village);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (formData: FormData) => {
    if (!villageToEdit) return;
    return updateVillage({ id: villageToEdit._id, body: formData }).unwrap();
  };

  const handleDelete = (id: string) => {
    const village = villages?.find((v) => v._id === id) || null;
    setVillageToDelete(village);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (villageToDelete) {
      try {
        await deleteVillage(villageToDelete._id).unwrap();
        showSuccessToast("Village deleted successfully.");
        setIsDeleteOpen(false);
        setVillageToDelete(null);
      } catch (err: any) {
        let errMsg = "Failed to delete village.";
        if (err?.data?.message === "validation.deletePrevented") {
          errMsg = "This village cannot be deleted because it contains active properties. Please delete or reassign its properties first.";
        } else if (err?.data?.message) {
          errMsg = err.data.message;
        }
        showErrorToast(errMsg);
      }
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/villages/${id}`);
  };

  const handleCreateSubmit = async (formData: FormData) => {
    await createVillage(formData).unwrap();
  };

  const developerOptions = useMemo(() => {
    if (!villages) return [];
    const developers = Array.from(new Set(villages.map((v) => v.developerName).filter(Boolean)));
    return developers.map((dev) => ({ label: dev, value: dev }));
  }, [villages]);

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

  if (isLoading) {
    return <VillagesSkeleton />;
  }

  if (isError) {
    return (
      <div className="w-full flex items-center justify-center py-32">
        <EmptyState message="Failed to load villages. Please try again later." />
      </div>
    );
  }

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
              key={village._id}
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
                : "No villages available."
            }
          />
        </div>
      )}

      {/* Reusable Create Village Drawer */}
      <CreateVillageDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSubmit}
        isLoading={isCreating}
      />

      {/* Reusable Edit Village Drawer */}
      <EditVillageDrawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setVillageToEdit(null);
        }}
        village={villageToEdit}
        onUpdate={handleEditSubmit}
        isLoading={isUpdating}
      />

      {/* Reusable Delete Village Modal */}
      <DeleteModal
        isLoading={isDeleting}
        disabled={isDeleting}       
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setVillageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this village ?"
        entityName={villageToDelete?.name}
        entitySubText={villageToDelete?.developerName}
        entityImage={villageToDelete?.coverImage}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default VillagesPage;