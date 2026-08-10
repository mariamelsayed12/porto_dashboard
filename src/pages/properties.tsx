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
import { useUnitsFilter } from "../hooks/useUnitsFilter";
import {
  useGetPropertyQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  type IProperty,
} from "../../app/services/crudproperties";
import { useGetVillageQuery } from "../../app/services/crudVillage";

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

  // ── Extended Drawer Filters Hook ───────────────────────────────────────────
  const {
    filters,
    tempFilters,
    setTempFilters,
    applyFilters,
    resetFilters,
  } = useUnitsFilter([]);

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

  // Helper mapping function for Property Types
  const mapPropertyTypeToApi = useCallback((type: string): string[] => {
    const t = type.toLowerCase();
    if (t === "chalet" || t === "chalets") {
      return ["Luxury Chalet", "Chalet"];
    }
    if (t === "villa" || t === "villas") {
      return ["Standalone Villa", "Water Villa Lagoon View", "Villa"];
    }
    if (t === "apartment" || t === "apartments") {
      return [
        "Studio Apartment",
        "Modern Apartment",
        "Penthouse with Private Pool",
        "Duplex Garden Unit",
        "Apartment",
        "Duplex",
        "Penthouse",
        "Studio",
        "Ground Floor"
      ];
    }
    if (t === "twin house" || t === "twinhouse" || t === "townhouse" || t === "town house") {
      return ["Twin House", "Townhouse Corner", "Town House"];
    }
    return [type];
  }, []);

  // Fetch villages to resolve name to ID
  const { data: villagesList } = useGetVillageQuery();

  // Helper to build query parameters for backend API
  const buildQueryParams = useCallback((
    filtersState: typeof filters,
    extraParams?: { page?: number; limit?: number }
  ) => {
    const params: Record<string, any> = {
      ...extraParams
    };

    if (searchQuery) {
      params.keyword = searchQuery;
    }

    if (selectedListing.length > 0) {
      params.listingType = selectedListing;
    }

    if (selectedStatus.length > 0) {
      params.status = selectedStatus;
    }

    const propTypesToUse: string[] = [];
    if (filtersState.propertyType) {
      propTypesToUse.push(...mapPropertyTypeToApi(filtersState.propertyType));
    }
    if (selectedPropertyType.length > 0) {
      selectedPropertyType.forEach(t => {
        propTypesToUse.push(...mapPropertyTypeToApi(t));
      });
    }
    if (propTypesToUse.length > 0) {
      params.propertyType = Array.from(new Set(propTypesToUse));
    }

    const loc = filtersState.location;
    if (loc && villagesList) {
      const found = villagesList.find(
        (v) => v.name.toLowerCase() === loc.toLowerCase()
      );
      if (found) {
        params.village = found._id;
      }
    }

    if (filtersState.bedrooms) {
      if (filtersState.bedrooms === "5+") {
        params["bedrooms[gte]"] = 5;
      } else {
        params.bedrooms = parseInt(filtersState.bedrooms, 10);
      }
    }

    if (filtersState.bathrooms) {
      if (filtersState.bathrooms === "3+") {
        params["bathrooms[gte]"] = 3;
      } else {
        params["bathrooms[gte]"] = parseFloat(filtersState.bathrooms);
      }
    }

    if (filtersState.areaFrom) {
      params["area[gte]"] = parseFloat(filtersState.areaFrom);
    }
    if (filtersState.areaTo) {
      params["area[lte]"] = parseFloat(filtersState.areaTo);
    }

    const isRentOnly = selectedListing.length === 1 && selectedListing[0].toLowerCase() === "rent";

    if (filtersState.priceFrom) {
      const key = isRentOnly ? "cashPrice[gte]" : "installmentPrice[gte]";
      params[key] = parseFloat(filtersState.priceFrom);
    }
    if (filtersState.priceTo) {
      const key = isRentOnly ? "cashPrice[lte]" : "installmentPrice[lte]";
      params[key] = parseFloat(filtersState.priceTo);
    }

    if (filtersState.downPayment) {
      params["downPaymentAmount[lte]"] = parseFloat(filtersState.downPayment);
    }
    if (filtersState.monthlyInstallment) {
      params["installmentValue[lte]"] = parseFloat(filtersState.monthlyInstallment);
    }

    if (filtersState.deliveryDate) {
      if (filtersState.deliveryDate.toLowerCase() === "ready") {
        params.deliveryDate = "Ready to Move";
      } else {
        params.deliveryDate = `${filtersState.deliveryDate}-12-30`;
      }
    }

    if (filtersState.finishing) {
      const finishVal = filtersState.finishing
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      params.finishingStatus = finishVal;
    }

    if (activeSort) {
      if (activeSort === "newest") params.sort = "-createdAt";
      else if (activeSort === "oldest") params.sort = "createdAt";
      else if (activeSort === "min-price") {
        params.sort = isRentOnly ? "cashPrice" : "installmentPrice";
      } else if (activeSort === "max-price") {
        params.sort = isRentOnly ? "-cashPrice" : "-installmentPrice";
      } else if (activeSort === "sooner-delivery") params.sort = "deliveryDate";
      else if (activeSort === "late-delivery") params.sort = "-deliveryDate";
    }

    return params;
  }, [
    searchQuery,
    selectedListing,
    selectedStatus,
    selectedPropertyType,
    villagesList,
    activeSort,
    mapPropertyTypeToApi,
  ]);

  // Construct main query parameters
  const queryParams = useMemo(() => {
    return buildQueryParams(filters, { page: currentPage, limit: 10 });
  }, [filters, currentPage, buildQueryParams]);

  // Construct temp query parameters for drawer count
  const tempQueryParams = useMemo(() => {
    return buildQueryParams(tempFilters, { limit: 1 });
  }, [tempFilters, buildQueryParams]);

  // Fetch paginated properties data
  const { data: propertiesResponse, isLoading } = useGetPropertyQuery(queryParams);

  // Fetch count of matching items for the drawer
  const { data: tempPropertiesResponse } = useGetPropertyQuery(
    tempQueryParams,
    { skip: !isFilterDrawerOpen }
  );

  const activeTempFilteredCount = tempPropertiesResponse?.results || 0;

  const totalPages = useMemo(() => {
    return propertiesResponse?.paginationResult?.numberOfPages || 1;
  }, [propertiesResponse]);

  const limit = useMemo(() => {
    return propertiesResponse?.paginationResult?.limit || 10;
  }, [propertiesResponse]);

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
        const totalResults = propertiesResponse?.results || 0;
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
        { label: "Apartment", value: "Apartment" },
        { label: "Twin house", value: "Twin house" },
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
      />

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <DataTable<IProperty>
        columns={propertiesColumns}
        data={propertiesResponse?.data || []}
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
      {(propertiesResponse?.results || 0) > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-text-darker font-poppins order-2 sm:order-1">
            Showing{" "}
            <span className="font-medium text-text-secondary">
              {Math.min(
                (currentPage - 1) * limit + 1,
                propertiesResponse?.results || 0,
              )}
              –{Math.min(currentPage * limit, propertiesResponse?.results || 0)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text-secondary">
              {propertiesResponse?.results}
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

      {/* ── Create Drawer ────────────────────────────────────────────────── */}
      <PropertyFormDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isCreateLoading}
        mode="create"
      />

      {/* ── Edit Drawer ───────────────────────────────────────────────────── */}
      <PropertyFormDrawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setPropertyToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={isUpdateLoading}
        mode="edit"
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
