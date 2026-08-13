import { useState, useMemo, useCallback } from "react";
import {
  useNavigate,
  useSearchParams,
  useOutletContext,
} from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import DataTable, {
  type ColumnDef,
  type ActionDef,
} from "../components/Ui/DataTable";
import Pagination from "../components/Ui/Pagination";
import DeleteModal from "../components/Ui/DeleteModal";
import PropertyFormDrawer from "../components/Properties/PropertyFormDrawer";
import defaultImage from "../assets/default.png";
import { truncateText } from "../utils";
import FilterSortSection, {
  type FilterConfig,
} from "../components/Ui/FilterSortSection";
import { showSuccessToast, showErrorToast } from "../components/Ui/Toast";
import FilterDrawer from "../components/Ui/filterCcomponents/FilterDrawer";
import { useUnitsFilter, getPriceForProperty } from "../hooks/useUnitsFilter";
import {
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  type IProperty,
} from "../../app/services/crudproperties";

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-successGreen text-text-secondary",
    "available soon": "bg-warning text-text-secondary",
    pending: "bg-[#fcf8eb] text-text-secondary",
    "sold out": "bg-brandBlue text-text-secondary",
    rented: "bg-brandBlue text-text-secondary",
    "not available": "bg-errorRed text-text-secondary",
  };
  const cls = styles[status.toLowerCase()] ?? "bg-light-gray text-text-darker";
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-[13px] font-medium whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

const propertiesColumns: ColumnDef<IProperty>[] = [
  {
    key: "createdAt",
    label: "Creation date",
    width: "w-[13%]",
    render: (v) => (
      <span className="whitespace-nowrap text-text-darker font-medium">
        {v ? new Date(v as string).toLocaleDateString("en-GB") : "—"}
      </span>
    ),
  },
  {
    key: "name",
    label: "Property name",
    width: "w-[26%]",
    render: (v) => (
      <span
        className="block max-w-[220px] truncate font-medium text-text-secondary"
        title={v as string}
      >
        {truncateText(v as string, 20)}
      </span>
    ),
  },
  {
    key: "village",
    label: "Village",
    width: "w-[18%]",
    render: (v) => (
      <span className="block max-w-[150px] truncate">
        {(v as any)?.name || "—"}
      </span>
    ),
  },
  {
    key: "listingType",
    label: "Listing type",
    width: "w-[14%]",
    render: (v) => <span className="whitespace-nowrap">{v as string}</span>,
  },
  {
    key: "installmentPrice",
    label: "Price",
    width: "w-[13%]",
    render: (_, row) => {
      if (row.listingType?.toLowerCase() === "rent") {
        return (
          <span className="font-medium text-text-secondary flex flex-col leading-tight whitespace-nowrap">
            <span>{row.cashPrice !== undefined && row.cashPrice !== null ? `${(row.cashPrice as number).toLocaleString()} EGP / mo` : "—"}</span>
            <span className="text-[11px] text-text-darker">{row.insurance !== undefined && row.insurance !== null ? `Ins: ${(row.insurance as number).toLocaleString()} EGP` : ""}</span>
          </span>
        );
      }
      if (row.paymentModel?.toLowerCase() === "cash") {
        return (
          <span className="font-medium text-text-secondary whitespace-nowrap">
            {row.cashPrice !== undefined && row.cashPrice !== null
              ? `${(row.cashPrice as number).toLocaleString()} EGP`
              : "—"}
          </span>
        );
      }
      if (row.paymentModel?.toLowerCase() === "both") {
        return (
          <span className="font-medium text-text-secondary flex flex-col leading-tight whitespace-nowrap">
            <span>{row.installmentPrice ? `${row.installmentPrice.toLocaleString()} EGP` : "—"}</span>
            <span className="text-[11px] text-text-darker">{row.cashPrice ? `Cash: ${row.cashPrice.toLocaleString()} EGP` : ""}</span>
          </span>
        );
      }
      return (
        <span className="font-medium text-text-secondary whitespace-nowrap">
          {row.installmentPrice !== undefined && row.installmentPrice !== null
            ? `${(row.installmentPrice as number).toLocaleString()} EGP`
            : "—"}
        </span>
      );
    },
  },
  {
    key: "status",
    label: "Property status",
    width: "w-[16%]",
    render: (v) => <StatusBadge status={v as string} />,
  },
  {
    key: "finishingStatus",
    label: "Finishing status",
    width: "w-[16%]",
    render: (v) => (
      <span className="whitespace-nowrap">{(v as string) ?? "—"}</span>
    ),
  },
  {
    key: "deliveryDate",
    label: "Delivery date",
    width: "w-[16%]",
    render: (v) => {
      const val = v as string;
      if (!val) return <span className="whitespace-nowrap">—</span>;
      if (val === "Ready to Move") {
        return <span className="whitespace-nowrap">{val}</span>;
      }
      if (val.includes("T")) {
        return <span className="whitespace-nowrap">{val.split("T")[0]}</span>;
      }
      return <span className="whitespace-nowrap">{val}</span>;
    },
  },
];

// ─── PropertiesPage ───────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Create drawer
  const { isCreateOpen, setIsCreateOpen } = useOutletContext<{
    isCreateOpen: boolean;
    setIsCreateOpen: (open: boolean) => void;
  }>();

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<IProperty | null>(
    null,
  );

  // More Filters drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Fetch properties data (all, up to limit 1000)
  const { data: propertiesResponse, isLoading } = useGetPropertyQuery();

  // ── Filter values from URL ─────────────────────────────────────────────────
  const selectedListing = useMemo(() => {
    const val = searchParams.get("listingType");
    return val ? val.split(",") : [];
  }, [searchParams]);

  const selectedPropertyType = useMemo(() => {
    const val = searchParams.get("propertyType");
    return val ? val.split(",") : [];
  }, [searchParams]);

  const selectedStatus = useMemo(() => {
    const val = searchParams.get("status");
    return val ? val.split(",") : [];
  }, [searchParams]);

  const activeSort = useMemo(() => {
    return searchParams.get("sort") || "";
  }, [searchParams]);

  // Reset to page 1 when search query changes
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

  // Update URL filter parameters
  const handleFilterChange = (key: string, values: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (values.length > 0) {
      newParams.set(key, values.join(","));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
    setCurrentPage(1);
  };

  const handleSortChange = (sortVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (sortVal) {
      newParams.set("sort", sortVal);
    } else {
      newParams.delete("sort");
    }
    setSearchParams(newParams, { replace: true });
    setCurrentPage(1);
  };

  const topFilteredProperties = useMemo(() => {
    const rawProperties = propertiesResponse?.data || [];
    return rawProperties.filter((p) => {
      // Search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesKeyword =
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.village?.name?.toLowerCase().includes(q) ||
          p.propertyType?.toLowerCase().includes(q);
        if (!matchesKeyword) return false;
      }

      // Listing Type filter
      if (selectedListing.length > 0) {
        const matchesListing = selectedListing.some(
          (l) => l.toLowerCase() === p.listingType?.toLowerCase()
        );
        if (!matchesListing) return false;
      }

      // Status filter
      if (selectedStatus.length > 0) {
        const matchesStatus = selectedStatus.some(
          (s) => s.toLowerCase() === p.status?.toLowerCase()
        );
        if (!matchesStatus) return false;
      }

      // Top Property Type filter (this filters by property type selection from top bar)
      if (selectedPropertyType.length > 0) {
        const selectedTypes = selectedPropertyType.map(t => t.toLowerCase());
        const unitType = (p.propertyType || "").toLowerCase();
        const matchesType = selectedTypes.some(targetType => {
          const isChalet = (t: string) => t === "chalet" || t === "challet" || t === "chalets" || t === "challets";
          if (isChalet(targetType)) {
            return isChalet(unitType);
          }
          if (targetType === "twin house" || targetType === "twinhouse" || targetType === "townhouse" || targetType === "town house") {
            return (
              unitType.includes("twin") ||
              unitType.includes("town")
            );
          }
          return unitType === targetType || unitType.includes(targetType);
        });
        if (!matchesType) return false;
      }

      return true;
    });
  }, [propertiesResponse?.data, searchQuery, selectedListing, selectedStatus, selectedPropertyType]);

  // ── Extended Drawer Filters Hook ───────────────────────────────────────────
  const {
    tempFilters,
    setTempFilters,
    applyFilters,
    resetFilters,
    filteredUnits,
    tempFilteredCount,
  } = useUnitsFilter(topFilteredProperties);

  // Sort the filtered units client-side
  const sortedProperties = useMemo(() => {
    const list = [...filteredUnits];

    const getDeliveryYear = (unit: IProperty) => {
      if (!unit.deliveryDate) return 9999;
      if (unit.deliveryDate.toLowerCase() === "ready to move" || unit.deliveryDate.toLowerCase() === "ready") {
        return 0;
      }
      if (unit.deliveryDate.includes("-")) {
        return parseInt(unit.deliveryDate.split("-")[0], 10) || 9999;
      }
      return parseInt(unit.deliveryDate, 10) || 9999;
    };

    list.sort((a, b) => {
      switch (activeSort) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "min-price":
          return getPriceForProperty(a) - getPriceForProperty(b);
        case "max-price":
          return getPriceForProperty(b) - getPriceForProperty(a);
        case "sooner-delivery":
          return getDeliveryYear(a) - getDeliveryYear(b);
        case "late-delivery":
          return getDeliveryYear(b) - getDeliveryYear(a);
        default:
          return 0;
      }
    });

    return list;
  }, [filteredUnits, activeSort]);

  const limit = 10;

  const paginatedProperties = useMemo(() => {
    return sortedProperties.slice((currentPage - 1) * limit, currentPage * limit);
  }, [sortedProperties, currentPage, limit]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedProperties.length / limit) || 1;
  }, [sortedProperties.length, limit]);

  const activeTempFilteredCount = tempFilteredCount;

  const [createProperty, { isLoading: isCreateLoading }] = useCreatePropertyMutation();
  const [deleteProperty,{isLoading: deleteLoading}] = useDeletePropertyMutation();
  const [updateProperty, { isLoading: isUpdateLoading }] = useUpdatePropertyMutation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<IProperty | null>(null);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleViewDetails = useCallback(
    (property: IProperty) => navigate(`/properties/${property._id}`),
    [navigate],
  );

  const handleOpenEdit = useCallback((property: IProperty) => {
    setPropertyToEdit(property);
    setIsEditOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(async (formData: FormData) => {
    await createProperty(formData).unwrap();
    setIsCreateOpen(false);
  }, [createProperty, setIsCreateOpen]);

  const handleEditSubmit = useCallback(async (formData: FormData) => {
    if (!propertyToEdit) return;
    await updateProperty({ id: propertyToEdit._id, body: formData }).unwrap();
    setIsEditOpen(false);
    setPropertyToEdit(null);
  }, [propertyToEdit, updateProperty]);

  const handleOpenDelete = useCallback((property: IProperty) => {
    setPropertyToDelete(property);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!propertyToDelete) return;
    try {
      await deleteProperty(propertyToDelete._id).unwrap();
      showSuccessToast("Property deleted successfully.");
      setIsDeleteOpen(false);
      setPropertyToDelete(null);
      setCurrentPage((prev) => {
        const totalResults = sortedProperties.length;
        const newTotal = Math.ceil((totalResults - 1) / limit);
        return Math.min(prev, Math.max(1, newTotal));
      });
    } catch (err: any) {
      showErrorToast(err?.data?.message || "Failed to delete property.");
    }
  }, [propertyToDelete, deleteProperty, propertiesResponse?.results, limit]);


  // ── Action column definitions ──────────────────────────────────────────────
  const tableActions: ActionDef<IProperty>[] = useMemo(
    () => [
      {
        key: "view",
        label: "View ",
        icon: <FiEye size={16} />,
        onClick: handleViewDetails,
      },
      {
        key: "edit",
        label: "Edit",
        icon: <FiEdit2 size={16} />,
        onClick: handleOpenEdit,
      },
      {
        key: "delete",
        label: "Delete ",
        icon: <FiTrash2 size={16} />,
        onClick: handleOpenDelete,
        className: "text-red-600  ",
      },
    ],
    [handleViewDetails, handleOpenDelete, handleOpenEdit],
  );

  // Filter config object for the filter bar dropdowns
  const filterConfigs: FilterConfig[] = [
    {
      id: "listingType",
      label: "Listing",
      options: [
        { label: "Developer", value: "Developer" },
        { label: "Resale", value: "Resale" },
        { label: "Rent", value: "Rent" },
      ],
      value: selectedListing,
      onChange: (vals) => handleFilterChange("listingType", vals),
    },
    {
      id: "propertyType",
      label: "Property type",
      options: [
        { label: "Chalet", value: "Chalet" },
        { label: "Villa", value: "Villa" },
        { label: "Twin House", value: "Twin House" },
        { label: "Town House", value: "Town House" },
        { label: "Penthouse", value: "Penthouse" },
        { label: "Duplex", value: "Duplex" },
        { label: "Apartment", value: "Apartment" },
        { label: "Standalone Villa", value: "Standalone Villa" },
        { label: "Studio", value: "Studio" },
        {label:"Ground Floor", value:"ground_floor"}
       
      ],
      value: selectedPropertyType,
      onChange: (vals) => handleFilterChange("propertyType", vals),
    },
    {
      id: "status",
      label: "Property Status",
      options: [
        { label: "Available", value: "Available" },
        { label: "Available soon", value: "Available soon" },
        { label: "Sold out", value: "Sold out" },
        { label: "Not available", value: "Not available" },
      ],
      value: selectedStatus,
      onChange: (vals) => handleFilterChange("status", vals),
    },
  ];

  const sortOptions = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Minimum price", value: "min-price" },
    { label: "Maximum price", value: "max-price" },
    { label: "Sooner delivery date", value: "sooner-delivery" },
    { label: "Late delivery date", value: "late-delivery" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-6">
      {/* ── Filter & Sort Bar ────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 w-full">
        <div className="flex-1 w-full">
          <FilterSortSection
            searchPlaceholder="Search properties..."
            searchValue={searchQuery}
            onSearchChange={handleSearch}
            filters={filterConfigs}
            sortOptions={sortOptions}
            activeSortValue={activeSort}
            onSortChange={handleSortChange}
            onMoreFiltersClick={() => setIsFilterDrawerOpen(true)}
          />
        </div>
      </div>

      {/* More Filters Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        tempFilteredCount={activeTempFilteredCount}
        properties={propertiesResponse?.data || []}
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <DataTable<IProperty>
        columns={propertiesColumns}
        data={paginatedProperties}
        actions={tableActions}
        isLoading={isLoading}
        emptyMessage={
          searchQuery
            ? `No properties found for "${searchQuery}".`
            : "No properties listed yet. Click Add Property to get started."
        }
        onRowClick={handleViewDetails}
        minWidth="780px"
      />

      {/* ── Pagination + count ───────────────────────────────────────────── */}
      {sortedProperties.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-text-darker font-poppins order-2 sm:order-1">
            Showing{" "}
            <span className="font-medium text-text-secondary">
              {Math.min(
                (currentPage - 1) * limit + 1,
                sortedProperties.length,
              )}
              –{Math.min(currentPage * limit, sortedProperties.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text-secondary">
              {sortedProperties.length}
            </span>{" "}
            properties
          </p>

          <div className="order-1 sm:order-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* ── Property Form Drawer (Create & Edit Mode) ────────────────────── */}
      <PropertyFormDrawer
        isOpen={isCreateOpen || isEditOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setPropertyToEdit(null);
        }}
        onSubmit={isEditOpen ? handleEditSubmit : handleCreateSubmit}
        isLoading={isEditOpen ? isUpdateLoading : isCreateLoading}
        mode={isEditOpen ? "edit" : "create"}
        propertyId={propertyToEdit?._id}
      />

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      <DeleteModal
        isOpen={isDeleteOpen}
        isLoading={deleteLoading}
        onClose={() => {
          setIsDeleteOpen(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this property?"
        description="This action cannot be undone. All data associated with this property will be permanently removed."
        entityName={propertyToDelete?.name}
        entitySubText={propertyToDelete?.village?.name}
        entityImage={
          propertyToDelete?.coverImage ||
          (propertyToDelete?.images && propertyToDelete?.images[0]) ||
          defaultImage
        }
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}
