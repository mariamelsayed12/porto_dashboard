import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEye, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { mockProperties, propertyFormFields } from "../data";
import DataTable, { type ColumnDef, type ActionDef } from "../components/Ui/DataTable";
import Pagination from "../components/Ui/Pagination";
import DeleteModal from "../components/Ui/DeleteModal";
import FormDrawer from "../components/Ui/FormDrawer";
import Button from "../components/Ui/Button";
import defaultImage from "../assets/default.png";
import type { Property } from "../interface";

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-[#edf6eb] text-[#1a7a14]",
    "available soon": "bg-[#fcf8eb] text-[#9a7500]",
    pending: "bg-[#fcf8eb] text-[#9a7500]",
    "sold out": "bg-[#fcedeb] text-[#c0280f]",
    sold: "bg-[#fcedeb] text-[#c0280f]",
    rented: "bg-[#ebf0fc] text-[#1a3faa]",
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
        {v as string}
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
];

// ─── PropertiesPage ───────────────────────────────────────────────────────────

export default function PropertiesPage() {
  const navigate = useNavigate();

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

  // ── Derived data ───────────────────────────────────────────────────────────
  const filteredProperties = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return propertiesList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.listingType.toLowerCase().includes(q)
    );
  }, [searchQuery, propertiesList]);

  const totalPages = Math.ceil(filteredProperties.length / PAGE_SIZE);

  const pagedProperties = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProperties.slice(start, start + PAGE_SIZE);
  }, [filteredProperties, currentPage]);

  // Reset to page 1 when search changes
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  }, []);

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
    // If current page is now out of range, go back one
    setCurrentPage((prev) => {
      const newTotal = Math.ceil(updated.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q)
        );
      }).length / PAGE_SIZE);
      return Math.min(prev, Math.max(1, newTotal));
    });
  }, [propertyToDelete, propertiesList, searchQuery]);

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
        label: "View details",
        icon: <FiEye size={16} />,
        onClick: handleViewDetails,
      },
      {
        key: "edit",
        label: "Edit property",
        icon: <FiEdit2 size={16} />,
        onClick: (row) => navigate(`/properties/${row.id}`),
      },
      {
        key: "delete",
        label: "Delete property",
        icon: <FiTrash2 size={16} />,
        onClick: handleOpenDelete,
        className: "hover:text-red-600 hover:bg-red-50",
      },
    ],
    [handleViewDetails, handleOpenDelete, navigate]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col gap-6">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex items-center w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 w-[18px] h-[18px] text-text-naturalGray pointer-events-none" />
          <input
            type="text"
            id="properties-search"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, village or status..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-white text-text-secondary placeholder:text-text-naturalGray focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-[14px] font-poppins"
          />
        </div>

        {/* Create button */}
        <Button
          variant="create"
          leftIcon={<FiPlus size={16} />}
          onClick={() => setIsCreateOpen(true)}
          id="create-property-btn"
        >
          Add Property
        </Button>
      </div>

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