import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { mockProperties, propertyFormFields } from "../data";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import PropertyHeroCard from "../components/Ui/PropertyHeroCard";
import PropertyInfoCard from "../components/Ui/PropertyInfoCard";
import PricingCard from "../components/Ui/PricingCard";
import PropertyGalleryCard from "../components/Ui/PropertyGalleryCard";
import type { BreadcrumbItem } from "../components/Ui/BreadCrumb";
import type { Property } from "../interface";

import defaultImg from "../assets/default.png";

// ─── Layout context types (shared across detail pages) ────────────────────────

interface HeaderActionConfig {
  showActions: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
}

interface LayoutContextType {
  setBreadcrumbItems: (items: BreadcrumbItem[]) => void;
  setHeaderActions: (actions: HeaderActionConfig | null) => void;
}

// ─── PropertyDetailsPage ──────────────────────────────────────────────────────

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { setBreadcrumbItems, setHeaderActions } =
    useOutletContext<LayoutContextType>();

  // Load from localStorage (kept in sync with Properties page)
  const [propertiesList, setPropertiesList] = useState<Property[]>(() => {
    const saved = localStorage.getItem("porto_properties");
    return saved ? JSON.parse(saved) : mockProperties;
  });

  const property = useMemo(
    () => propertiesList.find((p) => String(p.id) === String(id)) ?? null,
    [propertiesList, id]
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // ── Breadcrumbs + Header actions ─────────────────────────────────────────
  useEffect(() => {
    if (property) {
      setBreadcrumbItems([
        { label: "Properties", href: "/properties" },
        { label: `${property.name} Details` },
      ]);
      setHeaderActions({
        showActions: true,
        onEdit: () => setIsEditOpen(true),
        onDelete: () => setIsDeleteOpen(true),
        editLabel: "Edit Property",
      });
    } else {
      setBreadcrumbItems([
        { label: "Properties", href: "/properties" },
        { label: "Not Found" },
      ]);
      setHeaderActions(null);
    }

    return () => {
      setBreadcrumbItems([]);
      setHeaderActions(null);
    };
  }, [property, setBreadcrumbItems, setHeaderActions]);

  // ── Edit form fields pre-filled from property data ────────────────────────
  const editFormFields = useMemo(() => {
    if (!property) return [];
    return propertyFormFields.map((field) => ({
      ...field,
      defaultValue:
        field.name === "name"
          ? property.name
          : field.name === "village"
          ? property.village
          : field.name === "developer"
          ? property.developer ?? ""
          : field.name === "price"
          ? property.price ?? ""
          : field.name === "listingType"
          ? property.listingType
          : field.name === "propertyType"
          ? property.propertyType ?? ""
          : field.defaultValue,
    }));
  }, [property]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditSubmit = (data: Record<string, unknown>) => {
    if (!property) return;
    const updatedList = propertiesList.map((p) =>
      String(p.id) === String(property.id)
        ? {
            ...p,
            name: (data.name as string) || p.name,
            village: (data.village as string) || p.village,
            developer: data.developer as string | undefined,
            price: data.price as string | undefined,
            listingType: (data.listingType as string) || p.listingType,
            propertyType: data.propertyType as string | undefined,
          }
        : p
    );
    setPropertiesList(updatedList);
    localStorage.setItem("porto_properties", JSON.stringify(updatedList));
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!property) return;
    const updatedList = propertiesList.filter(
      (p) => String(p.id) !== String(property.id)
    );
    localStorage.setItem("porto_properties", JSON.stringify(updatedList));
    setIsDeleteOpen(false);
    navigate("/properties");
  };

  // ── Not found state ───────────────────────────────────────────────────────
  if (!property) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-4">
        <p className="font-poppins font-medium text-[23px] text-text-secondary">
          Property Not Found
        </p>
        <button
          onClick={() => navigate("/properties")}
          className="h-10 px-6 bg-primary text-white rounded-md font-poppins font-medium text-[16px] hover:bg-[#156d85] transition-colors"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  // ── Pricing data object ───────────────────────────────────────────────────
  const pricingData = {
    totalPrice: property.totalPrice ?? (property.price ? `${property.price} EGP` : undefined),
    downPayment: property.downPayment,
    monthlyInstallment: property.monthlyInstallment,
    installmentPeriod: property.installmentPeriod,
    rentalYield: property.rentalYield,
    cashPrice: property.price ? `${property.price} EGP` : undefined,
  };

  // ─── Page Layout ────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">

      {/* ── Left Column (main content) ─────────────────────────────────────── */}
      <div className="flex flex-col gap-6 flex-1 min-w-0 w-full">

        {/* Hero card: image + info chips */}
        <PropertyHeroCard property={property} fallbackImage={defaultImg} />

        {/* Description + Amenities card */}
        <PropertyInfoCard
          description={property.description}
          amenities={property.amenities}
        />
      </div>

      {/* ── Right Column (sidebar) ────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 w-full lg:w-[411px] shrink-0">

        {/* Pricing card */}
        <PricingCard pricing={pricingData} />

        {/* Gallery card */}
        <PropertyGalleryCard
          images={property.gallery}
          fallbackImage={property.image || defaultImg}
          propertyName={property.name}
        />
      </div>

      {/* ── Edit Drawer ───────────────────────────────────────────────────── */}
      <FormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Property"
        fields={editFormFields}
        onSubmit={handleEditSubmit}
        submitText="Save Changes"
        cancelText="Cancel"
      />

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this property?"
        description="This action cannot be undone. All data associated with this property will be permanently removed."
        entityName={property.name}
        entitySubText={property.village}
        entityImage={property.image}
      />
    </div>
  );
}
