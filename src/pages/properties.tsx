import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { mockProperties, propertyFormFields } from "../data";
import DataTable, { type ColumnDef, type ActionDef } from "../components/Ui/DataTable";
import Pagination from "../components/Ui/Pagination";
import DeleteModal from "../components/Ui/DeleteModal";
import FormDrawer from "../components/Ui/FormDrawer";
import Button from "../components/Ui/Button";
import defaultImage from "../assets/default.png";
import type { Property } from "../interface";
import { truncateText } from "../utils";
import FilterSortSection, { type FilterConfig } from "../components/Ui/FilterSortSection";
import FilterDrawer from "../components/Ui/filterCcomponents/FilterDrawer";
import { useUnitsFilter, matchUnit } from "../hooks/useUnitsFilter";

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

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 6;

// ─── Column definitions ───────────────────────────────────────────────────────

const propertiesColumns: ColumnDef<Property>[] = [
  {
    key: "creationDate",
    label: "Creation date",
    width: "w-[13%]",
    render: (v) => (
      <span className="whitespace-nowrap text-text-darker font-medium">{v as string}</span>
    ),
  },
  {
    key: "name",
    label: "Property name",
    width: "w-[26%]",
    render: (v) => (
      <span className="block max-w-[220px] truncate font-medium text-text-secondary" title={v as string}>
        {truncateText(v as string, 20)}
      </span>
    ),
  },
  {
    key: "village",
    label: "Village",
    width: "w-[18%]",
    render: (v) => (
      <span className="block max-w-[150px] truncate">{v as string}</span>
    ),
  },
  {
    key: "listingType",
    label: "Listing type",
    width: "w-[14%]",
    render: (v) => (
      <span className="whitespace-nowrap">{v as string}</span>
    ),
  },
  {
    key: "price",
    label: "Price",
    width: "w-[13%]",
    render: (v) => (
      <span className="font-medium text-text-secondary whitespace-nowrap">
        {v ? `${v as string} EGP` : "—"}
      </span>
    ),
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
    render: (v) => <span className="whitespace-nowrap">{v as string ?? "—"}</span>
  },
  {
    key:"deliveryDate",
    label:"Delivery date",
    width:"w-[16%]",
    render:(v)=> <span className="whitespace-nowrap">{v as string}</span>
  }

];

// ─── PropertiesPage ───────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [propertiesList, setPropertiesList] = useState<Property[]>(() => {
    const saved = localStorage.getItem("porto_properties");
    return saved ? JSON.parse(saved) : mockProperties;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Create drawer
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Delete modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // More Filters drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // ── Extended Drawer Filters Hook ───────────────────────────────────────────
  const {
    filters,
    tempFilters,
    setTempFilters,
    applyFilters,
    resetFilters,
    tempFilteredCount,
  } = useUnitsFilter(propertiesList);

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

  // ── Derived data (Filtering + Sorting) ─────────────────────────────────────
  const filteredProperties = useMemo(() => {
    return propertiesList.filter((p) => {
      // 1. Text Search Query (filters by name, village, status, listingType)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          p.name.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          p.listingType.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // 2. Listing Type Filter
      if (selectedListing.length > 0) {
        const matchesListing = selectedListing.some(
          (type) => p.listingType.toLowerCase() === type.toLowerCase()
        );
        if (!matchesListing) return false;
      }

      // 3. Property Type Filter
      if (selectedPropertyType.length > 0) {
        const matchesPropType = selectedPropertyType.some(
          (type) => (p.propertyType || "").toLowerCase() === type.toLowerCase()
        );
        if (!matchesPropType) return false;
      }

      // 4. Property Status Filter
      if (selectedStatus.length > 0) {
        const matchesStatus = selectedStatus.some(
          (stat) => p.status.toLowerCase() === stat.toLowerCase()
        );
        if (!matchesStatus) return false;
      }

      // 5. Extended/Drawer filters using useUnitsFilter matchUnit logic
      if (!matchUnit(p, filters)) {
        return false;
      }

      return true;
    });
  }, [propertiesList, searchQuery, selectedListing, selectedPropertyType, selectedStatus, filters]);

  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (!activeSort) return list;

    const parsePrice = (priceStr: string | undefined): number => {
      if (!priceStr) return 0;
      return parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
    };

    const parseDate = (dateStr: string): number => {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
      return new Date(dateStr).getTime() || 0;
    };

    list.sort((a, b) => {
      if (activeSort === "newest") {
        return parseDate(b.creationDate) - parseDate(a.creationDate);
      }
      if (activeSort === "oldest") {
        return parseDate(a.creationDate) - parseDate(b.creationDate);
      }
      if (activeSort === "min-price") {
        return parsePrice(a.price) - parsePrice(b.price);
      }
      if (activeSort === "max-price") {
        return parsePrice(b.price) - parsePrice(a.price);
      }
      if (activeSort === "sooner-delivery") {
        const da = a.deliveryDate ? parseInt(a.deliveryDate, 10) || 9999 : 9999;
        const db = b.deliveryDate ? parseInt(b.deliveryDate, 10) || 9999 : 9999;
        return da - db;
      }
      if (activeSort === "late-delivery") {
        const da = a.deliveryDate ? parseInt(a.deliveryDate, 10) || 0 : 0;
        const db = b.deliveryDate ? parseInt(b.deliveryDate, 10) || 0 : 0;
        return db - da;
      }
      return 0;
    });

    return list;
  }, [filteredProperties, activeSort]);

  const totalPages = Math.ceil(sortedProperties.length / PAGE_SIZE);

  const pagedProperties = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedProperties.slice(start, start + PAGE_SIZE);
  }, [sortedProperties, currentPage]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleViewDetails = useCallback(
    (property: Property) => navigate(`/properties/${property.id}`),
    [navigate]
  );

  const handleOpenDelete = useCallback((property: Property) => {
    setPropertyToDelete(property);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!propertyToDelete) return;
    const updated = propertiesList.filter((p) => p.id !== propertyToDelete.id);
    setPropertiesList(updated);
    localStorage.setItem("porto_properties", JSON.stringify(updated));
    setIsDeleteOpen(false);
    setPropertyToDelete(null);
    setCurrentPage((prev) => {
      const newTotal = Math.ceil(updated.length / PAGE_SIZE);
      return Math.min(prev, Math.max(1, newTotal));
    });
  }, [propertyToDelete, propertiesList]);

  const handleCreateSubmit = useCallback(
    (data: Record<string, unknown>) => {
      const newId = Date.now();
      const coverImage =
        (data.media as { cover?: string } | undefined)?.cover ?? defaultImage;

      const newProperty: Property = {
        id: newId,
        name: (data.name as string) || "New Property",
        village: (data.village as string) || "",
        developer: (data.developer as string) || "",
        listingType: (data.listingType as string) || "Developer",
        price: data.price as string | undefined,
        status: "Available",
        creationDate: new Date().toLocaleDateString("en-GB").split("/").join("/"),
        image: coverImage,
        location: data.location as string | undefined,
        propertyType: data.propertyType as string | undefined,
        amenities: data.amenities as string[] | undefined,
        finishingStatus: data.finishingStatus as string | undefined,
        deliveryDate: data.deliveryDate as string | undefined,
      };

      const updated = [newProperty, ...propertiesList];
      setPropertiesList(updated);
      localStorage.setItem("porto_properties", JSON.stringify(updated));
      setIsCreateOpen(false);
      setCurrentPage(1);
    },
    [propertiesList]
  );

  // ── Action column definitions ──────────────────────────────────────────────
  const tableActions: ActionDef<Property>[] = useMemo(
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
        onClick: (row) => navigate(`/properties/${row.id}`),
      },
      {
        key: "delete",
        label: "Delete ",
        icon: <FiTrash2 size={16} />,
        onClick: handleOpenDelete,
        className: "text-red-600  ",
      },
    ],
    [handleViewDetails, handleOpenDelete, navigate]
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
        { label: "Pending", value: "Pending" },
        { label: "Sold out", value: "Sold out" },
        { label: "Rented", value: "Rented" },
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

        <Button
          variant="create"
          leftIcon={<FiPlus size={16} />}
          onClick={() => setIsCreateOpen(true)}
          id="create-property-btn"
          className="self-end xl:self-auto h-10 px-6 rounded-[12px]"
        >
          Add Property
        </Button>
      </div>

      {/* More Filters Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        tempFilters={tempFilters}
        setTempFilters={setTempFilters}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        tempFilteredCount={tempFilteredCount}
      />


      {/* ── Table ───────────────────────────────────────────────────────── */}
      <DataTable<Property>
        columns={propertiesColumns}
        data={pagedProperties}
        actions={tableActions}
        isLoading={false}
        emptyMessage={
          searchQuery
            ? `No properties found for "${searchQuery}".`
            : "No properties listed yet. Click Add Property to get started."
        }
        onRowClick={handleViewDetails}
        minWidth="780px"
      />

      {/* ── Pagination + count ───────────────────────────────────────────── */}
      {filteredProperties.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-text-darker font-poppins order-2 sm:order-1">
            Showing{" "}
            <span className="font-medium text-text-secondary">
              {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredProperties.length)}–
              {Math.min(currentPage * PAGE_SIZE, filteredProperties.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-text-secondary">
              {filteredProperties.length}
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
      <FormDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        title="Add New Property"
        submitText="Create Property"
        fields={propertyFormFields}
      />

      {/* ── Delete Modal ─────────────────────────────────────────────────── */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this property?"
        description="This action cannot be undone. All data associated with this property will be permanently removed."
        entityName={propertyToDelete?.name}
        entitySubText={propertyToDelete?.village}
        entityImage={propertyToDelete?.image}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}