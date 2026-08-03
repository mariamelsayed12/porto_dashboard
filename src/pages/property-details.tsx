import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { propertyFormFields } from "../data";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import PropertyHeroCard from "../components/Ui/PropertyHeroCard";
import PropertyInfoCard from "../components/Ui/PropertyInfoCard";
import PricingCard from "../components/Ui/PricingCard";
import PropertyGalleryCard from "../components/Ui/PropertyGalleryCard";
import type { BreadcrumbItem } from "../components/Ui/BreadCrumb";
import { showSuccessToast, showErrorToast } from "../components/Ui/Toast";
import PropertyDetailsSkeleton from "../components/Properties/PropertyDetailsSkeleton";
import {
  useGetPropertyByIdQuery,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} from "../../app/services/crudproperties";

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

  const { data: property, isLoading, error } = useGetPropertyByIdQuery(
    { id: id || "", lang: "en" },
    { skip: !id }
  );

  const [updateProperty] = useUpdatePropertyMutation();
  const [deleteProperty] = useDeletePropertyMutation();

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
    } else if (!isLoading && error) {
      setBreadcrumbItems([
        { label: "Properties", href: "/properties" },
        { label: "Error" },
      ]);
      setHeaderActions(null);
    } else if (!isLoading) {
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
  }, [property, isLoading, error, setBreadcrumbItems, setHeaderActions]);

  // ── Edit form fields pre-filled from property data ────────────────────────
  const editFormFields = useMemo(() => {
    if (!property) return [];
    return propertyFormFields.map((field) => ({
      ...field,
      defaultValue:
        field.name === "name"
          ? property.name
          : field.name === "village"
          ? property.village?.name || ""
          : field.name === "developer"
          ? property.village?.name || ""
          : field.name === "price"
          ? property.installmentPrice?.toString() ?? ""
          : field.name === "listingType"
          ? property.listingType
          : field.name === "propertyType"
          ? property.propertyType ?? ""
          : field.defaultValue,
    }));
  }, [property]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditSubmit = async (data: Record<string, unknown>) => {
    if (!property) return;
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "media") {
          const media = data.media as any;
          if (media?.file) {
            formData.append("coverImage", media.file);
          }
        } else if (key === "amenities" && Array.isArray(data[key])) {
          (data[key] as string[]).forEach((val) => formData.append("amenities", val));
        } else {
          formData.append(key, String(data[key] ?? ""));
        }
      });

      await updateProperty({ id: property._id, body: formData }).unwrap();
      showSuccessToast("Property details updated successfully.");
      setIsEditOpen(false);
    } catch (err: any) {
      showErrorToast(err?.data?.message || "Failed to update property.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!property) return;
    try {
      await deleteProperty(property._id).unwrap();
      showSuccessToast("Property deleted successfully.");
      setIsDeleteOpen(false);
      navigate("/properties");
    } catch (err: any) {
      showErrorToast(err?.data?.message || "Failed to delete property.");
    }
  };

  // 1. Loading state
  if (isLoading) {
    return <PropertyDetailsSkeleton />;
  }

  // 2. Error state
  if (error) {
    const is404 = (error as any)?.status === 404;

    if (is404) {
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

    return (
      <div className="w-full flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
        <p className="font-poppins font-medium text-[23px] text-red-600">
          An error occurred while loading property details.
        </p>
        <p className="text-text-secondary text-sm max-w-md">
          {((error as any)?.data?.message || (error as any)?.error || "Please check your network and try again.")}
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

  // 3. Not Found (empty response data)
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
    totalPrice: property.installmentPrice ? `${property.installmentPrice.toLocaleString()} EGP` : undefined,
    downPayment: property.downPaymentAmount ? `${property.downPaymentAmount.toLocaleString()} EGP` : undefined,
    monthlyInstallment: property.installmentValue ? `${property.installmentValue.toLocaleString()} EGP` : undefined,
    installmentPeriod: property.installmentPeriod,
    rentalYield: undefined,
    cashPrice: property.installmentPrice ? `${property.installmentPrice.toLocaleString()} EGP` : undefined,
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
          images={property.images}
          fallbackImage={property.coverImage || (property.images && property.images[0]) || defaultImg}
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
        entitySubText={property.village?.name}
        entityImage={property.coverImage || (property.images && property.images[0]) || defaultImg}
      />
    </div>
  );
}
