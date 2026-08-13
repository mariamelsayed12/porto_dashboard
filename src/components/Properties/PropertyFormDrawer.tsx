import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiX, FiUpload, FiTrash2, FiPlus, FiAlertCircle, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useGetVillageQuery } from "../../../app/services/crudVillage";
import { useGetPropertyByIdQuery } from "../../../app/services/crudproperties";
import { showSuccessToast, showErrorToast } from "../Ui/Toast";
import Button from "../Ui/Button";
import Input from "../Ui/Input";
import MultiSelectDropdown from "../Ui/MultiSelectDropdown";
import { ALLOWED_PROPERTY_AMENITIES, PROPERTY_TYPES } from "../../data";
import { propertyValidationSchema } from "../../validation";
import { PropertyFormDrawerSkeleton } from "./formSkeleton";
import InputErrorMessage from "../Ui/InputErrorMessage";
import { compressImage } from "../../utils/imageCompression";

interface PropertyFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<any>;
  isLoading?: boolean;
  mode: "create" | "edit";
  propertyId?: string;
}
const STATUS_OPTIONS_BY_LISTING_TYPE: Record<string, string[]> = {
  Developer: ["Available", "Sold Out", "Not Available"],
  Resale: ["Available", "Sold Out", "Not Available"],
  Rent: ["Available", "Not Available", "Available Soon"],
};

const formatDeliveryDateForInput = (dateStr: any): string => {
  if (!dateStr) return "";
  if (dateStr === "Ready to Move") return "Ready to Move";

  if (typeof dateStr === "string" && dateStr.includes("T")) {
    return dateStr.split("T")[0];
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    console.error("Failed to parse date", e);
  }

  return dateStr;
};

export default function PropertyFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  mode,
  propertyId,
}: PropertyFormDrawerProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Fetch villages List to resolve name to ID
  const { data: villagesList } = useGetVillageQuery();

  // Fetch existing property details (English & Arabic) if in edit mode
  const { data: propertyEn, isFetching: isEnFetching } = useGetPropertyByIdQuery(
    { id: propertyId || "", lang: "en" },
    { skip: mode !== "edit" || !propertyId || !isOpen }
  );
  const { data: propertyAr, isFetching: isArFetching } = useGetPropertyByIdQuery(
    { id: propertyId || "", lang: "ar" },
    { skip: mode !== "edit" || !propertyId || !isOpen }
  );

  const isInitializing = mode === "edit" && (isEnFetching || isArFetching || !propertyEn || !propertyAr);

  // Searchable village dropdown state
  const [villageSearch, setVillageSearch] = useState("");
  const [isVillageOpen, setIsVillageOpen] = useState(false);
  const villageDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for village dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        villageDropdownRef.current &&
        !villageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsVillageOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredVillages = useMemo(() => {
    if (!villagesList) return [];
    if (!villageSearch.trim()) return villagesList;
    return villagesList.filter((v) =>
      v.name.toLowerCase().includes(villageSearch.toLowerCase())
    );
  }, [villagesList, villageSearch]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(propertyValidationSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
      village: "",
      listingType: "Developer",
      status: "Available",
      paymentModel: "Installments",
      area: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      finishingStatus: "Finished",
      orientation: "",
      propertyType: "",
      coverImage: undefined,
      images: [],
      isFeatured: "No",
      deliveryDate: "",
      availableUnits: 1,
      installmentPrice: undefined,
      cashPrice: undefined,
      insurance: undefined,
      downPaymentPercentage: undefined,
      downPaymentAmount: undefined,
      installmentPeriod: "",
      installmentValue: undefined,
      amenities: [],
    },
  });

  // Watch field values for dynamic layouts/previews
  const watchVillage = watch("village");
  const watchListingType = watch("listingType");
  const watchPaymentModel = watch("paymentModel");
  const watchFinishingStatus = watch("finishingStatus");
  const watchIsFeatured = watch("isFeatured");
  const watchCoverImage = watch("coverImage") as File | string | undefined;
  const watchImages = watch("images") as (File | string)[] || [];
  const watchDeliveryDate = watch("deliveryDate");
  const watchStatus = watch("status");

  const activeStatusOptions = useMemo(() => {
    return STATUS_OPTIONS_BY_LISTING_TYPE[watchListingType] || STATUS_OPTIONS_BY_LISTING_TYPE.Developer;
  }, [watchListingType]);

  // Automatically clear/reset the status if it becomes invalid for the selected listingType
  useEffect(() => {
    if (!isOpen) return;
    if (watchStatus) {
      const validStatuses = STATUS_OPTIONS_BY_LISTING_TYPE[watchListingType] || [];
      if (!validStatuses.includes(watchStatus)) {
        setValue("status", "" as any, { shouldValidate: true });
      }
    }
  }, [watchListingType, watchStatus, setValue, isOpen]);

  // Local state for image preview URLs
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);

  // Update cover preview
  useEffect(() => {
    if (watchCoverImage instanceof File) {
      const url = URL.createObjectURL(watchCoverImage);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof watchCoverImage === "string") {
      setCoverPreviewUrl(watchCoverImage);
    } else {
      setCoverPreviewUrl(null);
    }
  }, [watchCoverImage]);

  // Update gallery previews
  useEffect(() => {
    if (Array.isArray(watchImages) && watchImages.length > 0) {
      const urls = watchImages.map((img) => {
        if (img instanceof File) {
          return URL.createObjectURL(img);
        }
        return img || "";
      });
      setGalleryPreviewUrls(urls);
      return () => urls.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    } else {
      setGalleryPreviewUrls([]);
    }
  }, [watchImages]);

  // Populate or reset form values based on mode and query data
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && propertyEn && propertyAr) {
        reset({
          name: {
            en: propertyEn.name || "",
            ar: propertyAr.name || "",
          },
          description: {
            en: propertyEn.description || "",
            ar: propertyAr.description || "",
          },
          village: propertyEn.village?._id || "",
          listingType: propertyEn.listingType || "Developer",
          status: propertyEn.status || "Available",
          paymentModel: propertyEn.paymentModel || "Installments",
          area: propertyEn.area,
          bedrooms: propertyEn.bedrooms,
          bathrooms: propertyEn.bathrooms,
          finishingStatus: propertyEn.finishingStatus || "Finished",
          orientation: propertyEn.orientation || "",
          propertyType: propertyEn.propertyType || "",
          coverImage: propertyEn.coverImage || "",
          images: propertyEn.images || [],
          isFeatured: propertyEn.isFeatured || "No",
          deliveryDate: formatDeliveryDateForInput(propertyEn.deliveryDate),
          availableUnits: propertyEn.availableUnits || 1,
          installmentPrice: propertyEn.installmentPrice || undefined,
          cashPrice: propertyEn.cashPrice || undefined,
          insurance: propertyEn.insurance || undefined,
          downPaymentPercentage: propertyEn.downPaymentPercentage || undefined,
          downPaymentAmount: propertyEn.downPaymentAmount || undefined,
          installmentPeriod: propertyEn.installmentPeriod || "",
          installmentValue: propertyEn.installmentValue || undefined,
          amenities: propertyEn.amenities || [],
        } as any);
        setCoverPreviewUrl(propertyEn.coverImage || null);
        setGalleryPreviewUrls(propertyEn.images || []);
      } else if (mode === "create") {
        reset({
          name: { en: "", ar: "" },
          description: { en: "", ar: "" },
          village: "",
          listingType: "Developer",
          status: "Available",
          paymentModel: "Installments",
          area: undefined,
          bedrooms: undefined,
          bathrooms: undefined,
          finishingStatus: "Finished",
          orientation: "",
          propertyType: "",
          coverImage: undefined,
          images: [],
          isFeatured: "No",
          deliveryDate: "",
          availableUnits: 1,
          installmentPrice: undefined,
          cashPrice: undefined,
          insurance: undefined,
          downPaymentPercentage: undefined,
          downPaymentAmount: undefined,
          installmentPeriod: "",
          installmentValue: undefined,
          amenities: [],
        } as any);
        setCoverPreviewUrl(null);
        setGalleryPreviewUrls([]);
      }
    }
  }, [isOpen, mode, propertyEn, propertyAr, reset]);

  // Retrieve current village display name
  const currentVillageName = useMemo(() => {
    if (!watchVillage || !villagesList) return "";
    const found = villagesList.find((v) => v._id === watchVillage);
    return found ? found.name : "";
  }, [watchVillage, villagesList]);

  // File Upload Handlers
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("coverImage", file, { shouldValidate: true });
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = watchImages || [];
    const newImages = [...currentImages, ...files].slice(0, 15); // Limit to 15 images
    setValue("images", newImages, { shouldValidate: true });
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("coverImage", undefined as any, { shouldValidate: true });
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleRemoveGalleryImage = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentImages = watchImages || [];
    const updatedImages = currentImages.filter((_, i) => i !== idx);
    setValue("images", updatedImages, { shouldValidate: true });
  };

  // Predefined amenities options
  const amenitiesOptions = useMemo(() => {
    return ALLOWED_PROPERTY_AMENITIES.map((item) => ({
      label: item.en,
      value: item.value,
    }));
  }, []);

  // Form Submit Handler
  const onSubmitHandler = async (data: any) => {
    try {
      setIsCompressing(true);

      // Compress cover image
      let finalCover = data.coverImage;
      if (data.coverImage instanceof File) {
        try {
          finalCover = await compressImage(data.coverImage);
        } catch (compressErr) {
          console.error("Failed to compress cover image:", compressErr);
          showErrorToast("Failed to compress cover image. Submitting original.");
        }
      }

      // Compress gallery images
      const finalImages: (File | string)[] = [];
      if (Array.isArray(data.images)) {
        for (const img of data.images) {
          if (img instanceof File) {
            try {
              const comp = await compressImage(img);
              finalImages.push(comp);
            } catch (compressErr) {
              console.error("Failed to compress gallery image:", compressErr);
              showErrorToast("Failed to compress a gallery image. Submitting original.");
              finalImages.push(img);
            }
          } else {
            finalImages.push(img);
          }
        }
      }

      const formData = new FormData();

      // Nested bilingual inputs
      formData.append("name[en]", data.name.en.trim());
      formData.append("name[ar]", data.name.ar.trim());
      formData.append("description[en]", data.description.en.trim());
      formData.append("description[ar]", data.description.ar.trim());

      // Basic fields
      formData.append("village", data.village);
      formData.append("listingType", data.listingType);
      formData.append("status", data.status);
      formData.append("paymentModel", data.paymentModel ||"Cash");
      formData.append("area", String(data.area));
      formData.append("bedrooms", String(data.bedrooms));
      formData.append("bathrooms", String(data.bathrooms));
      formData.append("finishingStatus", data.finishingStatus);
      formData.append("orientation", data.orientation.trim());
      formData.append("propertyType", data.propertyType.trim());

      // Files
      if (finalCover instanceof File) {
        formData.append("coverImage", finalCover);
      }

      if (Array.isArray(finalImages)) {
        finalImages.forEach((imgFile: any) => {
          if (imgFile instanceof File) {
            formData.append("images", imgFile);
          } else if (typeof imgFile === "string") {
            formData.append("images", imgFile);
          }
        });
      }

      // Optional fields
      if (data.isFeatured) {
        formData.append("isFeatured", data.isFeatured);
      }

      if (data.deliveryDate && data.deliveryDate.trim() !== "") {
        formData.append("deliveryDate", data.deliveryDate.trim());
      }

      if (data.availableUnits !== undefined && data.availableUnits !== null) {
        formData.append("availableUnits", String(data.availableUnits));
      }

      if (
        data.installmentPrice !== undefined &&
        data.installmentPrice !== null &&
        data.installmentPrice !== ""
      ) {
        formData.append("installmentPrice", String(data.installmentPrice));
      }

      if (
        data.cashPrice !== undefined &&
        data.cashPrice !== null &&
        data.cashPrice !== ""
      ) {
        formData.append("cashPrice", String(data.cashPrice));
      }

      if (
        data.insurance !== undefined &&
        data.insurance !== null &&
        data.insurance !== ""
      ) {
        formData.append("insurance", String(data.insurance));
      }

      if (
        data.downPaymentPercentage !== undefined &&
        data.downPaymentPercentage !== null &&
        data.downPaymentPercentage !== ""
      ) {
        formData.append("downPaymentPercentage", String(data.downPaymentPercentage));
      }

      if (
        data.downPaymentAmount !== undefined &&
        data.downPaymentAmount !== null &&
        data.downPaymentAmount !== ""
      ) {
        formData.append("downPaymentAmount", String(data.downPaymentAmount));
      }

      if (data.installmentPeriod) {
        formData.append("installmentPeriod", data.installmentPeriod.trim());
      }

      if (
        data.installmentValue !== undefined &&
        data.installmentValue !== null &&
        data.installmentValue !== ""
      ) {
        formData.append("installmentValue", String(data.installmentValue));
      }

      // Amenities list
      if (Array.isArray(data.amenities)) {
        data.amenities.forEach((amenity: string) => {
          formData.append("amenities", amenity);
        });
      }

      await onSubmit(formData);
      showSuccessToast(
        mode === "edit"
          ? "Property updated successfully."
          : "Property created successfully."
      );
      onClose();
    } catch (err: any) {
      let errorMsg = mode === "edit" ? "Failed to update property." : "Failed to create property.";
      if (err?.data?.message) {
        if (Array.isArray(err.data.message)) {
          errorMsg = err.data.message.join(", ");
        } else {
          errorMsg = err.data.message;
        }
      } else if (err?.message) {
        errorMsg = err.message;
      }
      showErrorToast(errorMsg);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0f0f14]/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sliding Panel Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
            className="relative z-10 flex h-full w-full flex-col bg-[#F5F9FA] shadow-2xl sm:max-w-[550px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#C0C4C8] bg-[#F5F9FA]">
              <h2 className="text-[23px] font-medium text-text-secondary font-poppins">
                {mode === "edit" ? "Edit Property" : "Create Property"}
              </h2>
              <Button
                onClick={onClose}
                variant="icon"
                className="flex items-center justify-center p-2 rounded-xl text-text-darker hover:bg-[#EDEFF2] hover:text-text-secondary transition-colors"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </Button>
            </div>

            {/* Form Content / Initializing loader */}
            {isInitializing ? (
              <PropertyFormDrawerSkeleton/>
            ) : (
              <>
                {/* Scrollable Form Content */}
                <form
                  onSubmit={handleSubmit(onSubmitHandler)}
                  className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6"
                >
                  {Object.keys(errors).length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                      <FiAlertCircle className="w-5 h-5 shrink-0" />
                      <span>Please correct validation errors below</span>
                    </div>
                  )}

                  {/* Property Name - English & Arabic */}
                  <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                    <span className="text-sm font-semibold text-text-secondary font-poppins">
                      Property Name
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Property Name (English)"
                        placeholder="e.g. Standard Studio"
                        required
                        {...register("name.en")}
                        error={errors.name?.en?.message}
                      />
                      <Input
                        label="Property Name (Arabic)"
                        placeholder="مثال: ستوديو قياسي"
                        required
                        dir="rtl"
                        {...register("name.ar")}
                        error={errors.name?.ar?.message}
                      />
                    </div>
                  </div>

                  {/* Searchable Village Selector */}
                  <div className="flex flex-col gap-1.5 border-b border-[#D4D5D8] pb-5" ref={villageDropdownRef}>
                    <label className="text-sm font-medium text-text-darker select-none">
                      Village <span className="text-primary ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div
                        onClick={() => setIsVillageOpen(!isVillageOpen)}
                        className={`flex h-12 w-full items-center justify-between rounded-sm border bg-white px-3 text-base cursor-pointer transition-all duration-200 ${
                          errors.village ? "border-red-500" : "border-[#747474] hover:border-[#464646]"
                        }`}
                      >
                        <span className={currentVillageName ? "text-text-secondary" : "text-text-naturalGray"}>
                          {currentVillageName || "Select a village"}
                        </span>
                        <FiChevronDown className="text-text-secondary w-5 h-5 shrink-0" />
                      </div>

                      {isVillageOpen && (
                        <div className="absolute left-0 right-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-sm border border-border bg-white shadow-lg">
                          <div className="p-2 border-b border-border">
                            <input
                              type="text"
                              value={villageSearch}
                              onChange={(e) => setVillageSearch(e.target.value)}
                              placeholder="Search village..."
                              className="w-full h-8 px-2 text-sm border border-border rounded focus:outline-none focus:border-primary"
                            />
                          </div>
                          {(filteredVillages || []).length > 0 ? (
                            (filteredVillages || []).map((village) => (
                              <div
                                key={village._id}
                                onClick={() => {
                                  setValue("village", village._id, { shouldValidate: true });
                                  setIsVillageOpen(false);
                                  setVillageSearch("");
                                }}
                                className={`px-3 py-2 text-sm hover:bg-light-primary cursor-pointer transition-colors ${
                                  watchVillage === village._id ? "bg-[#E9F4F7] text-primary font-medium" : "text-text-secondary"
                                }`}
                              >
                                {village.name}
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-xs text-text-naturalGray text-center">
                              No villages match search query
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <InputErrorMessage msg={errors.village?.message} />
                  </div>

                  {/* Listing Type Chips */}
                  <div className="flex flex-col gap-2 border-b border-[#D4D5D8] pb-5">
                    <label className="text-sm font-medium text-text-darker select-none">
                      Listing Type <span className="text-primary ml-1">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["Developer", "Resale", "Rent"].map((type) => {
                        const isSelected = watchListingType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setValue("listingType", type as any, { shouldValidate: true })}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-[#B9DBE5] border-primary text-[#141414]"
                                : "bg-white border-[#D4D5D8] text-text-darker hover:border-gray-400"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>
                    <InputErrorMessage msg={errors.listingType?.message} />
                  </div>

                  {/* Property Status Select */}
                  <div className="flex flex-col gap-1.5 border-b border-[#D4D5D8] pb-5">
                    <label className="text-sm font-medium text-text-darker select-none">
                      Property Status <span className="text-primary ml-1">*</span>
                    </label>
                    <div className="relative w-full">
                      <select
                        {...register("status")}
                        className={`h-12 w-full appearance-none rounded-sm border bg-white px-3 pr-10 text-base text-text-secondary outline-none transition-all duration-200 focus:border-primary ${
                          errors.status ? "border-red-500" : "border-[#747474] hover:border-[#464646]"
                        }`}
                      >
                        <option value="" disabled>Select status</option>
                        {activeStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 shrink-0 pointer-events-none" />
                    </div>
                    <InputErrorMessage msg={errors.status?.message} />
                  </div>

                  {/* Finishing Status Chips */}
                  <div className="flex flex-col gap-2 border-b border-[#D4D5D8] pb-5">
                    <label className="text-sm font-medium text-text-darker select-none">
                      Finishing Status <span className="text-primary ml-1">*</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["Fully Furnished", "Finished", "Semi Finished", "Not Finished"].map((status) => {
                        const isSelected = watchFinishingStatus === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setValue("finishingStatus", status as any, { shouldValidate: true })}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-[#B9DBE5] border-primary text-[#141414]"
                                : "bg-white border-[#D4D5D8] text-text-darker hover:border-gray-400"
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                    <InputErrorMessage msg={errors.finishingStatus?.message} />
                  </div>

                  {/* Orientation & Property Type inputs side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#D4D5D8] pb-5">
                    <Input
                      label="Orientation"
                      placeholder="e.g. Sea View"
                      required
                      {...register("orientation")}
                      error={errors.orientation?.message}
                    />
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-sm font-medium text-text-darker select-none">
                        Property Type <span className="text-primary ml-1">*</span>
                      </label>
                      <div className="relative w-full">
                        <select
                          {...register("propertyType")}
                          className={`h-12 w-full appearance-none rounded-sm border bg-white px-3 pr-10 text-base text-text-secondary outline-none transition-all duration-200 focus:border-primary ${
                            errors.propertyType ? "border-red-500" : "border-[#747474] hover:border-[#464646]"
                          }`}
                        >
                          <option value="" disabled>Select property type</option>
                          {PROPERTY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5 shrink-0 pointer-events-none" />
                      </div>
                      <InputErrorMessage msg={errors.propertyType?.message} />
                    </div>
                  </div>

                  {/* Featured Selection Chips */}
                  <div className="flex flex-col gap-2 border-b border-[#D4D5D8] pb-5">
                    <label className="text-sm font-medium text-text-darker select-none">
                      Featured Property <span className="text-primary ml-1">*</span>
                    </label>
                    <div className="flex gap-3">
                      {["Yes", "No"].map((featured) => {
                        const isSelected = watchIsFeatured === featured;
                        return (
                          <button
                            key={featured}
                            type="button"
                            onClick={() => setValue("isFeatured", featured as any, { shouldValidate: true })}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                              isSelected
                                ? "bg-[#B9DBE5] border-primary text-[#141414]"
                                : "bg-white border-[#D4D5D8] text-text-darker hover:border-gray-400"
                            }`}
                          >
                            {featured}
                          </button>
                        );
                      })}
                    </div>
                    <InputErrorMessage msg={errors.isFeatured?.message} />
                  </div>

                  {/* Specifications: Area, Bedrooms, Bathrooms, Available Units */}
                  <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                    <span className="text-sm font-semibold text-text-secondary font-poppins">
                      Specifications
                    </span>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Area (SQM)"
                        type="number"
                        placeholder="e.g. 120"
                        required
                        {...register("area")}
                        error={errors.area?.message}
                      />
                      <Input
                        label="Available Units"
                        type="number"
                        placeholder="e.g. 1"
                        {...register("availableUnits")}
                        error={errors.availableUnits?.message}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Bedrooms"
                        type="number"
                        placeholder="e.g. 3"
                        required
                        {...register("bedrooms")}
                        error={errors.bedrooms?.message}
                      />
                      <Input
                        label="Bathrooms"
                        type="number"
                        placeholder="e.g. 2"
                        required
                        {...register("bathrooms")}
                        error={errors.bathrooms?.message}
                      />
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div className="flex flex-col gap-3 border-b border-[#D4D5D8] pb-5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-text-darker select-none">
                        Delivery Date
                      </label>
                      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={watchDeliveryDate === "Ready to Move"}
                          onChange={(e) => {
                            setValue("deliveryDate", e.target.checked ? "Ready to Move" : "", { shouldValidate: true });
                          }}
                          className="rounded border-[#747474] text-primary focus:ring-primary w-4 h-4"
                        />
                        Ready to Move
                      </label>
                    </div>
                    {watchDeliveryDate !== "Ready to Move" && (
                      <Input
                        className="cursor-pointer"
                        type="date"
                        placeholder="Select delivery date"
                        {...register("deliveryDate")}
                        error={errors.deliveryDate?.message}
                      />
                    )}
                  </div>

                  {/* Bilingual Descriptions */}
                  <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                    <span className="text-sm font-semibold text-text-secondary font-poppins">
                      Descriptions
                    </span>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-text-darker select-none">
                          Description (English) <span className="text-primary ml-1">*</span>
                        </label>
                        <textarea
                          placeholder="Enter detailed English description..."
                          {...register("description.en")}
                          rows={3}
                          className={`w-full p-3 text-base text-text-secondary rounded-sm border bg-white outline-none transition-all duration-200 focus:border-primary resize-y ${
                            errors.description?.en ? "border-red-500" : "border-[#747474] hover:border-[#464646]"
                          }`}
                        />
                        <InputErrorMessage msg={errors.description?.en?.message} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-text-darker select-none">
                          Description (Arabic) <span className="text-primary ml-1">*</span>
                        </label>
                        <textarea
                          placeholder="أدخل الوصف التفصيلي باللغة العربية..."
                          dir="rtl"
                          {...register("description.ar")}
                          rows={3}
                          className={`w-full p-3 text-base text-text-secondary rounded-sm border bg-white outline-none transition-all duration-200 focus:border-primary resize-y ${
                            errors.description?.ar ? "border-red-500" : "border-[#747474] hover:border-[#464646]"
                          }`}
                        />
                        <InputErrorMessage msg={errors.description?.ar?.message} />
                      </div>
                    </div>
                  </div>

                  {/* Rent Pricing (Monthly Rent & Insurance) */}
                  {watchListingType === "Rent" && (
                    <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                      <span className="text-sm font-semibold text-text-secondary font-poppins">
                        Rental Pricing Details
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Monthly Rent (EGP)"
                          type="number"
                          placeholder="e.g. 15000"
                          {...register("cashPrice")}
                          error={errors.cashPrice?.message}
                        />
                        <Input
                          label="Insurance (EGP)"
                          type="number"
                          placeholder="e.g. 50000"
                          {...register("insurance")}
                          error={errors.insurance?.message}
                        />
                      </div>
                    </div>
                  )}

                  {/* Buy/Sale Pricing Models */}
                  {watchListingType !== "Rent" && (
                    <>
                      {/* Payment Model Selection Chips */}
                      <div className="flex flex-col gap-2 border-b border-[#D4D5D8] pb-5">
                        <label className="text-sm font-medium text-text-darker select-none">
                          Payment Model <span className="text-primary ml-1">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {["Cash", "Installments", "Both"].map((model) => {
                            const isSelected = watchPaymentModel === model;
                            return (
                              <button
                                key={model}
                                type="button"
                                onClick={() => setValue("paymentModel", model as any, { shouldValidate: true })}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-all ${
                                  isSelected
                                    ? "bg-[#B9DBE5] border-primary text-[#141414]"
                                    : "bg-white border-[#D4D5D8] text-text-darker hover:border-gray-400"
                                }`}
                              >
                                {model === "Both" ? "Cash & Installment" : model}
                              </button>
                            );
                          })}
                        </div>
                        <InputErrorMessage msg={errors.paymentModel?.message} />
                      </div>

                      {/* Cash Pricing Details */}
                      {(watchPaymentModel === "Cash" || watchPaymentModel === "Both") && (
                        <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                          <span className="text-sm font-semibold text-text-secondary font-poppins">
                            Cash Pricing Details
                          </span>
                          <div className="flex flex-col gap-1.5">
                            <Input
                              label="Cash Price (EGP)"
                              type="number"
                              placeholder="e.g. 4500000"
                              {...register("cashPrice")}
                              error={errors.cashPrice?.message}
                            />
                          </div>
                        </div>
                      )}

                      {/* Installment Pricing Details */}
                      {(watchPaymentModel === "Installments" || watchPaymentModel === "Both") && (
                        <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                          <span className="text-sm font-semibold text-text-secondary font-poppins">
                            Installment Pricing Details
                          </span>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Installment Price (EGP)"
                              type="number"
                              placeholder="e.g. 5000000"
                              {...register("installmentPrice")}
                              error={errors.installmentPrice?.message}
                            />
                            <Input
                              label="Installment Value (EGP)"
                              type="number"
                              placeholder="e.g. 20000"
                              {...register("installmentValue")}
                              error={errors.installmentValue?.message}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="Down Payment %"
                              type="number"
                              placeholder="e.g. 10"
                              {...register("downPaymentPercentage")}
                              error={errors.downPaymentPercentage?.message}
                            />
                            <Input
                              label="Down Payment (EGP)"
                              type="number"
                              placeholder="e.g. 500000"
                              {...register("downPaymentAmount")}
                              error={errors.downPaymentAmount?.message}
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Input
                              label="Installment Period"
                              placeholder="e.g. 7 Years, Monthly, Quarterly"
                              {...register("installmentPeriod")}
                              error={errors.installmentPeriod?.message}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Amenities Multi-select */}
                  <div className="border-b border-[#D4D5D8] pb-5">
                    <Controller
                      control={control}
                      name="amenities"
                      render={({ field: { value, onChange } }) => (
                        <MultiSelectDropdown
                          label="Amenities"
                          placeholder="Select amenities"
                          options={amenitiesOptions}
                          value={value || []}
                          onChange={onChange}
                          error={errors.amenities?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Cover & Gallery Image Upload Layout matching Figma */}
                  <div className="flex flex-col gap-4 border-b border-[#D4D5D8] pb-5">
                    <span className="text-sm font-semibold text-text-secondary font-poppins">
                      Media upload
                    </span>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Cover upload */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <label className="text-xs font-semibold text-[#141414]">
                          cover <span className="text-primary">*</span>
                        </label>
                        <div
                          onClick={() => !coverPreviewUrl && coverInputRef.current?.click()}
                          className={`group relative bg-white border border-[#d4d5d8] border-solid rounded-lg h-[166px] w-[294px] flex flex-col items-center justify-center overflow-hidden transition-all ${
                            !coverPreviewUrl ? "cursor-pointer hover:border-[#1e8cab] hover:bg-[#E9F4F7]/10" : ""
                          } ${errors.coverImage ? "border-red-500" : ""}`}
                        >
                          {coverPreviewUrl ? (
                            <>
                              <img
                                src={coverPreviewUrl}
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveCover}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow hover:bg-red-600 transition-colors"
                                aria-label="Remove cover image"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <FiUpload className="w-6 h-6 text-text-darker group-hover:text-primary transition-colors" />
                              <span className="text-xs text-text-naturalGray group-hover:text-text-darker transition-colors">
                                Upload Cover
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={coverInputRef}
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={handleCoverUpload}
                            className="hidden"
                          />
                        </div>
                        <InputErrorMessage msg={errors.coverImage?.message as string} />
                      </div>

                      {/* Gallery upload */}
                      <div className="flex flex-col gap-2 flex-1">
                        <label className="text-xs font-semibold text-[#141414]">
                          Gallery Images ({watchImages.length})
                        </label>
                        <div className="grid grid-cols-2 gap-3 h-[166px] overflow-y-auto border border-[#d4d5d8] border-solid rounded-lg p-2 bg-white">
                          {/* Plus button */}
                          {watchImages.length < 15 && (
                            <div
                              onClick={() => galleryInputRef.current?.click()}
                              className="border border-[#d4d5d8] border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1e8cab] hover:bg-[#E9F4F7]/10 transition-all h-[70px]"
                            >
                              <FiPlus className="w-5 h-5 text-text-darker" />
                              <span className="text-[10px] text-text-naturalGray">Add Image</span>
                            </div>
                          )}

                          {/* Preview blocks */}
                          {galleryPreviewUrls.map((url, idx) => (
                            <div
                              key={`gallery-${idx}`}
                              className="relative border border-[#d4d5d8] rounded-lg overflow-hidden h-[70px]"
                            >
                              <img
                                src={url}
                                alt={`Gallery preview ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleRemoveGalleryImage(idx, e)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors"
                                aria-label={`Remove gallery image ${idx + 1}`}
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}

                          <input
                            type="file"
                            ref={galleryInputRef}
                            multiple
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={handleGalleryUpload}
                            className="hidden"
                          />
                        </div>
                        <InputErrorMessage
                          msg={
                            errors.images
                              ? (Array.isArray(errors.images)
                                ? (errors.images.find((e: any) => e?.message)?.message || "Invalid gallery image")
                                : (errors.images.message as string))
                              : undefined
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </form>

                {/* Footer Actions */}
                <div className="flex justify-end items-center gap-4 px-6 py-6 border-t border-[#C0C4C8] bg-[#F5F9FA]">
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading || isCompressing}
                    variant="icon"
                    className="flex h-12 w-auto items-center justify-center p-2 rounded-xl text-[#1e8cab] text-base font-medium hover:bg-[#EDEFF2] transition-colors disabled:opacity-50 font-poppins"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit(onSubmitHandler)}
                    isLoading={isLoading || isCompressing}
                    disabled={isLoading || isCompressing}
                    variant="modalPrimary"
                    className="h-12 rounded-xl px-6 bg-[#1e8cab] hover:bg-[#156d85] font-poppins"
                  >
                    {isCompressing
                      ? "Compressing..."
                      : mode === "edit"
                      ? "Save Changes"
                      : "Create"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
