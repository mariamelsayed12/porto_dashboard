import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiX, FiUpload, FiTrash2, FiPlus, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useGetVillageQuery } from "../../../app/services/crudVillage";
import { showSuccessToast, showErrorToast } from "../Ui/Toast";
import Button from "../Ui/Button";
import Input from "../Ui/Input";
import MultiSelectDropdown from "../Ui/MultiSelectDropdown";
import LocationPicker from "../Ui/LocationPicker";
import { ALLOWED_Village_AMENITIES } from "../../data";
import { validationSchema } from "../../validation";
import { compressImage } from "../../utils/imageCompression";

interface CreateVillageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: FormData) => Promise<any>;
  isLoading?: boolean;
}

export default function CreateVillageDrawer({
  isOpen,
  onClose,
  onCreate,
  isLoading = false,
}: CreateVillageDrawerProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const { data: villagesEn } = useGetVillageQuery({ lang: "en" });
  const { data: villagesAr } = useGetVillageQuery({ lang: "ar" });

  const locationOptions = useMemo(() => {
    if (!villagesEn || !villagesAr) return [];
    const optionsMap = new Map<string, { en: string; ar: string }>();
    villagesEn.forEach((v) => {
      const arVillage = villagesAr.find((av) => av._id === v._id);
      if (v.locationText && arVillage?.locationText) {
        optionsMap.set(v.locationText.toLowerCase(), {
          en: v.locationText,
          ar: arVillage.locationText,
        });
      }
    });
    return Array.from(optionsMap.values());
  }, [villagesEn, villagesAr]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      developerName: { en: "", ar: "" },
      locationText: { en: "", ar: "" },
      startingPrice: "" as any,
      rentalYield: "" as any,
      coverImage: null as any,
      galleryImages: [],
      googleMapsUrl: "",
      latitude: null,
      longitude: null,
      amenities: [],
    },
  });

  // Reset form to clean values when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset({
        name: { en: "", ar: "" },
        developerName: { en: "", ar: "" },
        locationText: { en: "", ar: "" },
        startingPrice: "" as any,
        rentalYield: "" as any,
        coverImage: null as any,
        galleryImages: [],
        googleMapsUrl: "",
        latitude: null,
        longitude: null,
        amenities: [],
      });
      setCoverPreviewUrl(null);
      setGalleryPreviewUrls([]);
    }
  }, [isOpen, reset]);

  const coverImage = watch("coverImage");
  const galleryImages = watch("galleryImages") as (File | string)[];

  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (coverImage instanceof File) {
      const url = URL.createObjectURL(coverImage);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [coverImage]);

  useEffect(() => {
    const urls = galleryImages.map((img) => {
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return img as string;
    });
    setGalleryPreviewUrls(urls);
    return () => {
      urls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [galleryImages]);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("coverImage", file, { shouldValidate: true });
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImages = galleryImages || [];
    if (currentImages.length + files.length > 5) {
      showErrorToast("Maximum 5 gallery images allowed");
      return;
    }
    setValue("galleryImages", [...currentImages, ...files], {
      shouldValidate: true,
    });
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setValue("galleryImages", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
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
      const finalGallery: (File | string)[] = [];
      if (Array.isArray(data.galleryImages)) {
        for (const img of data.galleryImages) {
          if (img instanceof File) {
            try {
              const comp = await compressImage(img);
              finalGallery.push(comp);
            } catch (compressErr) {
              console.error("Failed to compress gallery image:", compressErr);
              showErrorToast("Failed to compress a gallery image. Submitting original.");
              finalGallery.push(img);
            }
          } else {
            finalGallery.push(img);
          }
        }
      }

      const formData = new FormData();
      formData.append("name[en]", data.name.en);
      formData.append("name[ar]", data.name.ar);
      formData.append("developerName[en]", data.developerName.en);
      formData.append("developerName[ar]", data.developerName.ar);
      formData.append("locationText[en]", data.locationText.en);
      formData.append("locationText[ar]", data.locationText.ar);
      formData.append("startingPrice", String(data.startingPrice));
      formData.append("rentalYield", String(data.rentalYield));

      if (data.googleMapsUrl) {
        formData.append("googleMapsUrl", data.googleMapsUrl);
      }
      if (data.latitude !== null && data.latitude !== undefined) {
        formData.append("latitude", String(data.latitude));
      }
      if (data.longitude !== null && data.longitude !== undefined) {
        formData.append("longitude", String(data.longitude));
      }

      if (data.amenities) {
        data.amenities.forEach((amenity: string) => {
          formData.append("amenities", amenity);
        });
      }

      if (finalCover instanceof File) {
        formData.append("coverImage", finalCover);
      }

      if (finalGallery) {
        finalGallery.forEach((img: any) => {
          if (img instanceof File) {
            formData.append("galleryImages", img);
          } else if (typeof img === "string") {
            formData.append("galleryImages", img);
          }
        });
      }

      await onCreate(formData);
      showSuccessToast("Village created successfully.");
      onClose();
    } catch (err: any) {
      showErrorToast(err?.data?.message || "Failed to create village.");
    } finally {
      setIsCompressing(false);
    }
  };

  const amenitiesOptions = useMemo(() => {
    return ALLOWED_Village_AMENITIES.map((item) => ({
      label: item.en,
      value: item.value,
    }));
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[#0f0f14]/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Sliding Drawer Body */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
            className="relative z-10 flex h-full w-full flex-col bg-[#F5F9FA] shadow-2xl sm:max-w-[580px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#C0C4C8] bg-[#F5F9FA]">
              <h2 className="text-[23px] font-medium text-text-secondary">
                Create Village
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center p-2 rounded-xl text-text-darker hover:bg-[#EDEFF2] hover:text-text-secondary transition-colors"
                aria-label="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6"
            >
              {/* Form errors indicator */}
              {Object.keys(errors).length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  <FiAlertCircle className="w-5 h-5 shrink-0" />
                  <span>Please correct validation errors below</span>
                </div>
              )}

              {/* Village Name - English & Arabic Side-by-Side */}
              <div className="flex flex-col gap-4 border-b border-[#EDEFF2] pb-5">
                <span className="text-sm font-semibold text-text-secondary">
                  Village Name
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Village Name (English)"
                    placeholder="e.g. Porto Golf"
                    required
                    {...register("name.en")}
                    error={errors.name?.en?.message}
                  />
                  <Input
                    label="Village Name (Arabic)"
                    placeholder="مثال: بورتو جولف"
                    required
                    dir="rtl"
                    {...register("name.ar")}
                    error={errors.name?.ar?.message}
                  />
                </div>
              </div>

              {/* Developer Name - English & Arabic Side-by-Side */}
              <div className="flex flex-col gap-4 border-b border-[#EDEFF2] pb-5">
                <span className="text-sm font-semibold text-text-secondary">
                  Developer
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Developer Name (English)"
                    placeholder="e.g. Porto Developments"
                    required
                    {...register("developerName.en")}
                    error={errors.developerName?.en?.message}
                  />
                  <Input
                    label="Developer Name (Arabic)"
                    placeholder="مثال: عامر جروب"
                    required
                    dir="rtl"
                    {...register("developerName.ar")}
                    error={errors.developerName?.ar?.message}
                  />
                </div>
              </div>

              {/* Price and Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#EDEFF2] pb-5">
                <Input
                  label="Starting Price (EGP)"
                  type="number"
                  placeholder="e.g. 1000000"
                  required
                  {...register("startingPrice")}
                  error={errors.startingPrice?.message}
                />
                <Input
                  label="Rental Yield (%)"
                  type="number"
                  step="any"
                  placeholder="e.g. 7.5"
                  required
                  {...register("rentalYield")}
                  error={errors.rentalYield?.message}
                />
              </div>

              {/* Amenities Multi-select */}
              <div className="border-b border-[#EDEFF2] pb-5">
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

              {/* Cover Image Upload */}
              <div className="flex flex-col gap-2 border-b border-[#EDEFF2] pb-5">
                <label className="text-sm font-medium text-text-secondary">
                  Cover Image <span className="text-primary">*</span>
                </label>
                <div
                  onClick={() =>
                    !coverPreviewUrl && coverInputRef.current?.click()
                  }
                  className={`group relative bg-white border border-[#D4D5D8] border-dashed rounded-lg h-[166px] flex flex-col items-center justify-center overflow-hidden transition-all ${
                    !coverPreviewUrl
                      ? "cursor-pointer hover:border-[#1E8CAB]"
                      : ""
                  }`}
                >
                  {coverPreviewUrl ? (
                    <>
                      <img
                        src={coverPreviewUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                        <Button
                          type="button"
                          variant="create"
                          className="h-9 px-4 !bg-[#1E8CAB]"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          Replace
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-text-darker py-4">
                      <FiUpload className="w-8 h-8 text-[#747474]" />
                      <span className="text-xs font-normal">Upload Image</span>
                    </div>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverFileChange}
                  />
                </div>
                {errors.coverImage?.message && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.coverImage.message}
                  </span>
                )}
              </div>

              {/* Gallery Images Upload */}
              <div className="flex flex-col gap-2 border-b border-[#EDEFF2] pb-5">
                <label className="text-sm font-medium text-text-secondary">
                  Gallery Images
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                  {galleryPreviewUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative h-[100px] bg-white border border-[#D4D5D8] rounded-lg overflow-hidden shrink-0"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        onClick={() => removeGalleryImage(idx)}
                        variant="icon"
                        className="absolute inset-0 !bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity !w-full !h-full !rounded-none"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}

                  {/* Add Grid button if < 5 */}
                  {galleryPreviewUrls.length < 5 && (
                    <div
                      onClick={() => galleryInputRef.current?.click()}
                      className="border border-[#D4D5D8] border-dashed rounded-lg h-[100px] flex flex-col items-center justify-center cursor-pointer hover:border-[#1E8CAB] transition-all bg-white"
                    >
                      <FiPlus className="w-6 h-6 text-[#747474]" />
                      <span className="text-[10px] text-text-darker mt-1">
                        Upload Image
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleGalleryFileChange}
                />
                {errors.galleryImages?.message && (
                  <span className="text-xs text-red-500 mt-1">
                    {errors.galleryImages.message}
                  </span>
                )}
              </div>

              {/* Location Selector (Bilingual) */}
              <div className="pb-5">
                <Controller
                  control={control}
                  name="locationText"
                  render={({ field: { value: locationTextVal } }) => (
                    <LocationPicker
                      label="Location"
                      required
                      value={{
                        locationText: {
                          en: locationTextVal?.en || "",
                          ar: locationTextVal?.ar || "",
                        },
                        googleMapsUrl: watch("googleMapsUrl") || "",
                        latitude: watch("latitude") || 0,
                        longitude: watch("longitude") || 0,
                      }}
                      onChange={(newVal: any) => {
                        setValue("locationText", newVal.locationText, {
                          shouldValidate: true,
                        });
                        setValue("googleMapsUrl", newVal.googleMapsUrl, {
                          shouldValidate: true,
                        });
                        setValue("latitude", newVal.latitude, {
                          shouldValidate: true,
                        });
                        setValue("longitude", newVal.longitude, {
                          shouldValidate: true,
                        });
                      }}
                      options={locationOptions}
                      error={
                        errors.locationText?.en?.message ||
                        errors.locationText?.ar?.message
                      }
                      isArabic={false}
                    />
                  )}
                />
              </div>

              {/* Submit Button invisible helper */}
              <button type="submit" className="hidden" />
            </form>

            {/* Footer Actions */}
            <div className="flex justify-end items-center gap-4 px-6 py-5 border-t border-[#C0C4C8] bg-[#F5F9FA]">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading || isCompressing}
                variant="icon"
                className="flex h-12 w-auto items-center justify-center p-2 rounded-xl text-[#1e8cab] text-base font-medium hover:bg-[#EDEFF2] transition-colors disabled:opacity-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                isLoading={isLoading || isCompressing}
                disabled={isLoading || isCompressing}
                variant="modalPrimary"
                className="h-12 rounded-xl px-6 bg-[#1e8cab] hover:bg-[#156d85]"
              >
                {isCompressing ? "Compressing..." : "Create"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
