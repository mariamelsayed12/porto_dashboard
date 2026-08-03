import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import EditVillageDrawer from "../components/Villages/EditVillageDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import type { BreadcrumbItem } from "../components/Ui/BreadCrumb";
import { showSuccessToast, showErrorToast } from "../components/Ui/Toast";
import Spinner from "../components/Ui/LoadingSpinner";
import EmptyState from "../components/Ui/EmptyState";
import {
  useGetVillageQuery,
  useGetVillageByIdQuery,
  useUpdateVillageMutation,
  useDeleteVillageMutation,
} from "../../app/services/crudVillage";
import { useGetPropertyQuery } from "../../app/services/crudproperties";
import defaultImg from "../assets/default.png";
import GoogleMap from "../components/Ui/GoogleMap";
import VillageDetailsSkeleton from "../components/Villages/VillageDetailsSkeleton";

interface HeaderActionConfig {
  showActions: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
}


interface LayoutContextType {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  setBreadcrumbItems: (items: BreadcrumbItem[]) => void;
  setHeaderActions: (actions: HeaderActionConfig | null) => void;
}

export default function VillageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { setBreadcrumbItems, setHeaderActions } =
    useOutletContext<LayoutContextType>();

  const isObjectId = useMemo(
    () => (id ? /^[0-9a-fA-F]{24}$/.test(id) : false),
    [id],
  );

  const {
    data: villages,
    isLoading: isListLoading,
    isError: isListError,
  } = useGetVillageQuery();

  const resolvedId = useMemo(() => {
    if (!id) return "";
    if (isObjectId) return id;
    if (!villages) return "";
    const found = villages.find((v) => v.slug === id);
    return found ? found._id : "";
  }, [id, isObjectId, villages]);

  const {
    data: village,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useGetVillageByIdQuery(
    { id: resolvedId },
    { skip: !resolvedId }
  );

  const isLoading = isObjectId
    ? isDetailLoading
    : isListLoading || (villages && resolvedId ? isDetailLoading : !villages);

  const isError = isObjectId
    ? isDetailError
    : isListError || (villages !== undefined && (!resolvedId || isDetailError));

  const { data: propertiesResponse, isLoading: isPropertiesLoading } =
    useGetPropertyQuery({ lang: "en" });

  const propertyCount = useMemo(() => {
    const properties = propertiesResponse?.data;
    if (!properties || !village) return 0;
    return properties.filter((p) => p.village?._id === village._id).length;
  }, [propertiesResponse, village]);

  const [updateVillage, { isLoading: isUpdating }] = useUpdateVillageMutation();
  const [deleteVillage] = useDeleteVillageMutation();

  // Edit / Delete states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Sync breadcrumbs and header actions
  useEffect(() => {
    if (isLoading) {
      setBreadcrumbItems([
        { label: "Villages", href: "/villages" },
        { label: "Loading..." },
      ]);
      setHeaderActions(null);
    } else if (village) {
      setBreadcrumbItems([
        { label: "Villages", href: "/villages" },
        { label: `${village.name} Details` },
      ]);
      setHeaderActions({
        showActions: true,
        onEdit: () => setIsEditOpen(true),
        onDelete: () => setIsDeleteOpen(true),
        editLabel: "Edit Village",
      });
    } else {
      setBreadcrumbItems([
        { label: "Villages", href: "/villages" },
        { label: "Not Found" },
      ]);
      setHeaderActions(null);
    }

    return () => {
      setBreadcrumbItems([]);
      setHeaderActions(null);
    };
  }, [village, isLoading, setBreadcrumbItems, setHeaderActions]);

  const handleEditSubmit = async (formData: FormData) => {
    if (!village) return;
    return updateVillage({ id: village._id, body: formData }).unwrap();
  };

  const handleConfirmDelete = async () => {
    if (!village) return;
    try {
      await deleteVillage(village._id).unwrap();
      showSuccessToast("Village deleted successfully.");
      setIsDeleteOpen(false);
      navigate("/villages");
    } catch (err: any) {
      let errMsg = "Failed to delete village.";
      if (err?.data?.message === "validation.deletePrevented") {
        errMsg =
          "This village cannot be deleted because it contains active properties. Please delete or reassign its properties first.";
      } else if (err?.data?.message) {
        errMsg = err.data.message;
      }
      showErrorToast(errMsg);
    }
  };

  if (isLoading) {
    return <VillageDetailsSkeleton />;
  }

  if (isError || !village) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center text-center py-20 bg-[#f5f9fa]">
        <EmptyState message="Village Not Found" />
        <button
          onClick={() => navigate("/villages")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-poppins font-medium hover:bg-[#156D85] transition-colors"
        >
          Back to Villages
        </button>
      </div>
    );
  }

  const startingPriceFormatted = village.startingPrice
    ? `${village.startingPrice.toLocaleString()} EGP`
    : "N/A";

  return (
    <div className="w-full min-h-screen bg-[#f5f9fa] flex flex-col lg:flex-row gap-[24px] p-0 md:px-[32px]">
      {/* Left content panel */}
      <div className="flex-1 flex flex-col gap-[24px] max-w-full lg:max-w-[845px]">
        {/* Header banner card */}
        <div className="bg-white border border-border border-solid rounded-md flex flex-col md:flex-row  gap-[24px] w-full items-stretch">
          {/* Cover image banner container */}
          <div className="w-full md:w-[378px] h-[250px] md:h-auto rounded-l-md  overflow-hidden shrink-0 relative">
            <img
              src={village.coverImage || defaultImg}
              alt={village.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>

          {/* Details stack on right */}
          <div className="flex-1 p-[24px] flex flex-col gap-[24px] justify-between">
            {/* Header metadata */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                <h2 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
                  {village.name}
                </h2>
              </div>
              <p className="font-poppins font-medium text-[16px] text-[#464646] w-full">
                {village.developerName}
              </p>
            </div>

            {/* Stats boxes grid (2x2 layout) */}
            <div className="grid grid-cols-2 gap-[16px] md:gap-[24px] w-full">
              {/* Box 1: Starting Price */}
              <div className="bg-[#edeff2] border border-border border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  Starting price
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414] truncate max-w-full">
                  {isLoading ? <Spinner /> : `${startingPriceFormatted}`}
                </span>
              </div>

              {/* Box 3: properties Count */}
              <div className="bg-[#edeff2] border border-[#d4d5d8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  properties
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414]">
                  {isPropertiesLoading ? <Spinner /> : propertyCount}
                </span>
              </div>

              {/* Box 2: Amenities Count */}
              <div className="bg-[#edeff2] border border-[#d4d5d8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  Amenities
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414]">
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    `${village.amenities ? village.amenities.length : 0}`
                  )}
                </span>
              </div>

              {/* Box 3: Rental Yield */}
              {village.rentalYield !== undefined && (
                <div className="bg-[#edeff2] border border-[#d4d5d8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                  <span className="font-poppins font-normal text-[16px] text-[#464646]">
                    Rental yield
                  </span>
                  <span className="font-poppins font-medium text-[19px] text-[#141414]">
                    {isLoading ? <Spinner /> : `${village.rentalYield}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Amenities section card */}
        {village.amenities && village.amenities.length > 0 && (
          <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-[24px] flex flex-col gap-[24px] w-full">
            <h3 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
              Amenities
            </h3>
            <div className="flex flex-wrap gap-[16px] items-center w-full">
              {village.amenities.map((a, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#d4d5d8] border-solid px-[24px] py-[12px] rounded-[44px] select-none transition-colors duration-150 cursor-default"
                >
                  <p className="font-poppins font-medium text-[16px] text-[#464646] text-center leading-[normal]">
                    {a.charAt(0).toUpperCase() + a.slice(1)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Section Card */}
        {village.locationText && (
          <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] overflow-hidden w-full flex flex-col">
            <div className="h-[244px] w-full relative overflow-hidden shrink-0">
              <GoogleMap
                coordinates={
                  village.latitude && village.longitude
                    ? { lat: village.latitude, lng: village.longitude }
                    : (() => {
                        const parts = village.locationText.split(",");
                        const lat = parseFloat(parts[0]);
                        const lng = parseFloat(parts[1]);
                        return !isNaN(lat) && !isNaN(lng)
                          ? { lat, lng }
                          : undefined;
                      })()
                }
                googleMapsUrl={village.googleMapsUrl || village.locationText}
                title={village.name}
                className="relative w-full h-full group"
              />
            </div>
            <div className="p-[24px] flex flex-col items-start w-full">
              <div className="flex flex-col gap-[8px] items-start leading-[normal] w-full">
                <h3 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
                  Location
                </h3>
                <p className="font-poppins font-medium text-[16px] text-[#464646]">
                  {village.locationText}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right gallery sidebar column */}
      {village.galleryImages && village.galleryImages.length > 0 && (
        <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-[24px] flex flex-col gap-[24px] w-full lg:w-[411px] shrink-0">
          <h3 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
            Village Gallery
          </h3>
          <div className="flex flex-col gap-[24px] w-full">
            {village.galleryImages.map((imgUrl, idx) => (
              <div
                key={idx}
                className="h-[153px] rounded-[12px] overflow-hidden relative w-full shrink-0 shadow-xs border border-border"
              >
                <img
                  src={imgUrl}
                  alt={`Gallery photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Drawer (Edit Flow) */}
      <EditVillageDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        village={village}
        onUpdate={handleEditSubmit}
        isLoading={isUpdating}
      />

      {/* Delete Modal Confirmation overlay */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this village ?"
        entityName={village.name}
        entitySubText={village.developerName}
        entityImage={village.coverImage}
      />
    </div>
  );
}
