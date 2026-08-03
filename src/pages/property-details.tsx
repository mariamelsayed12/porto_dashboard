import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import PropertyFormDrawer from "../components/Properties/PropertyFormDrawer";
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

  const [updateProperty, { isLoading: isUpdateLoading }] = useUpdatePropertyMutation();
  const [deleteProperty,{isLoading:isDeleteloading}] = useDeletePropertyMutation();

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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleEditSubmit = useCallback(async (formData: FormData) => {
    if (!property) return;
    await updateProperty({ id: property._id, body: formData }).unwrap();
  }, [property, updateProperty]);

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
        <PricingCard pricing={pricingData} paymentType={property.paymentModel} />

        {/* Gallery card */}
        <PropertyGalleryCard
          images={property.images}
          fallbackImage={property.coverImage || (property.images && property.images[0]) || defaultImg}
          propertyName={property.name}
        />
      </div>

      {/* ── Edit Drawer ───────────────────────────────────────────────────── */}
      <PropertyFormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        isLoading={isUpdateLoading}
        mode="edit"
        propertyId={property._id}
      
      />

      {/* ── Delete Modal ──────────────────────────────────────────────────── */}
      <DeleteModal
        isOpen={isDeleteOpen}
        isLoading={isDeleteloading}
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
