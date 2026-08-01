import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FiX, FiUpload, FiTrash2, FiPlus, FiAlertCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import type { IVillage } from "../../../app/services/crudVillage";
import { showSuccessToast, showErrorToast } from "../Ui/Toast";
import Button from "../Ui/Button";
import Input from "../Ui/Input";
import MultiSelectDropdown from "../Ui/MultiSelectDropdown";

interface EditVillageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  village: IVillage | null;
  onUpdate: (formData: FormData) => Promise<any>;
  isLoading?: boolean;
}

const ALLOWED_AMENITIES = [
  { value: "Pools", en: "Pools", ar: "حمامات سباحة" },
  { value: "Marina", en: "Marina", ar: "مارينا" },
  { value: "Cafes", en: "Cafes", ar: "مقاهي" },
  { value: "Beaches", en: "Beaches", ar: "شواطئ" },
  { value: "Restaurants", en: "Restaurants", ar: "مطاعم" },
  { value: "Hotel Services", en: "Hotel Services", ar: "خدمات فندقية" },
  { value: "Security", en: "Security", ar: "أمن وحراسة" },
  { value: "Medical Services", en: "Medical Services", ar: "خدمات طبية" },
  { value: "Sports Facilities", en: "Sports Facilities", ar: "مرافق رياضية" },
  { value: "Gyms", en: "Gyms", ar: "صالات رياضية" },
  { value: "Spas", en: "Spas", ar: "سبا" },
  { value: "Clubhouse", en: "Clubhouse", ar: "كلوب هاوس" },
  { value: "Commercial Area", en: "Commercial Area", ar: "منطقة تجارية" },
  { value: "Green Areas", en: "Green Areas", ar: "مناطق خضراء" },
  { value: "Kids Area", en: "Kids Area", ar: "منطقة أطفال" },
];

const translations = {
  en: {
    title: "Edit Village",
    formLanguage: "Language",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    nameEn: "Village Name (English)",
    nameAr: "Village Name (Arabic)",
    developerEn: "Developer Name (English)",
    developerAr: "Developer Name (Arabic)",
    locationEn: "Location (English)",
    locationAr: "Location (Arabic)",
    startingPrice: "Starting Price (EGP)",
    rentalYield: "Rental Yield (%)",
    googleMapsUrl: "Google Maps URL",
    latitude: "Latitude",
    longitude: "Longitude",
    amenities: "Amenities",
    coverImage: "Cover Image",
    galleryImages: "Gallery Images (Max 5)",
    uploadNew: "Upload Image",
    replace: "Replace Image",
    placeholderPrice: "Enter starting price",
    placeholderYield: "Enter rental yield",
    placeholderUrl: "Enter Google Maps location URL",
    placeholderLat: "Enter latitude",
    placeholderLng: "Enter longitude",
  },
  ar: {
    title: "تعديل القرية",
    formLanguage: "اللغة",
    saveChanges: "حفظ التغييرات",
    cancel: "إلغاء",
    nameEn: "اسم القرية (بالإنجليزي)",
    nameAr: "اسم القرية (بالعربي)",
    developerEn: "اسم المطور (بالإنجليزي)",
    developerAr: "اسم المطور (بالعربي)",
    locationEn: "الموقع (بالإنجليزي)",
    locationAr: "الموقع (بالعربي)",
    startingPrice: "السعر المبدئي (جنيه)",
    rentalYield: "العائد الإيجاري (%)",
    googleMapsUrl: "رابط خرائط جوجل",
    latitude: "خط العرض",
    longitude: "خط الطول",
    amenities: "المرافق والخدمات",
    coverImage: "الصورة الرئيسية",
    galleryImages: "معرض الصور (الحد الأقصى 5)",
    uploadNew: "تحميل الصورة",
    replace: "استبدال الصورة",
    placeholderPrice: "أدخل السعر المبدئي",
    placeholderYield: "أدخل نسبة العائد الإيجاري",
    placeholderUrl: "أدخل رابط الموقع على خرائط جوجل",
    placeholderLat: "أدخل خط العرض",
    placeholderLng: "أدخل خط الطول",
  },
};

const validationSchema = yup.object().shape({
  name: yup.object().shape({
    en: yup.string().trim().min(3, "Must be at least 3 characters").max(100, "Cannot exceed 100 characters").required("Required"),
    ar: yup.string().trim().min(3, "Must be at least 3 characters").max(100, "Cannot exceed 100 characters").required("Required"),
  }),
  developerName: yup.object().shape({
    en: yup.string().trim().min(3, "Must be at least 3 characters").max(100, "Cannot exceed 100 characters").required("Required"),
    ar: yup.string().trim().min(3, "Must be at least 3 characters").max(100, "Cannot exceed 100 characters").required("Required"),
  }),
  locationText: yup.object().shape({
    en: yup.string().trim().min(3, "Must be at least 3 characters").max(100, "Cannot exceed 100 characters").required("Required"),
    ar: yup.string().trim().min(3, "Must be at least 3 characters").max(100, "Cannot exceed 100 characters").required("Required"),
  }),
  startingPrice: yup
    .number()
    .typeError("Must be a positive number")
    .positive("Must be greater than 0")
    .required("Required"),
  rentalYield: yup
    .number()
    .typeError("Must be a number >= 0")
    .min(0, "Must be at least 0")
    .required("Required"),
  coverImage: yup
    .mixed()
    .required("Cover image is required")
    .test("fileType", "Only JPEG, PNG, or WEBP images are accepted", (value) => {
      if (!value) return false;
      if (typeof value === "string") return true;
      if (value instanceof File) {
        return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type);
      }
      return false;
    }),
  galleryImages: yup
    .array()
    .of(
      yup.mixed().test("fileType", "Only JPEG, PNG, or WEBP images are accepted", (value) => {
        if (!value) return false;
        if (typeof value === "string") return true;
        if (value instanceof File) {
          return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type);
        }
        return false;
      })
    )
    .max(5, "Maximum 5 gallery images allowed")
    .optional(),
  googleMapsUrl: yup
    .string()
    .trim()
    .url("Must be a valid URL")
    .test("isGoogleMaps", "Must be a valid Google Maps URL", (value) => {
      if (!value) return true;
      return value.includes("google.com/maps") || value.includes("maps.app.goo.gl") || value.includes("goo.gl/maps");
    })
    .optional(),
  latitude: yup
    .number()
    .typeError("Must be a number")
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90")
    .optional()
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value),
  longitude: yup
    .number()
    .typeError("Must be a number")
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180")
    .optional()
    .nullable()
    .transform((value, originalValue) => originalValue === "" ? null : value),
  amenities: yup
    .array()
    .of(yup.string().required())
    .optional()
    .default([]),
});

export default function EditVillageDrawer({
  isOpen,
  onClose,
  village,
  onUpdate,
  isLoading = false,
}: EditVillageDrawerProps) {
  const [formLanguage, setFormLanguage] = useState<"en" | "ar">("en");
  const isArabic = formLanguage === "ar";
  const t = translations[formLanguage];

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

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
      startingPrice: 0,
      rentalYield: 0,
      coverImage: "",
      galleryImages: [],
      googleMapsUrl: "",
      latitude: null,
      longitude: null,
      amenities: [],
    },
  });

  // Populate data when drawer opens or village changes
  useEffect(() => {
    if (isOpen && village) {
      // Handle potential legacy values or nested structures
      const getLangValue = (val: any, lang: "en" | "ar") => {
        if (!val) return "";
        if (typeof val === "object") return val[lang] || "";
        return val;
      };

      reset({
        name: {
          en: getLangValue(village.name, "en"),
          ar: getLangValue(village.name, "ar"),
        },
        developerName: {
          en: getLangValue(village.developerName, "en"),
          ar: getLangValue(village.developerName, "ar"),
        },
        locationText: {
          en: getLangValue(village.locationText, "en"),
          ar: getLangValue(village.locationText, "ar"),
        },
        startingPrice: village.startingPrice || 0,
        rentalYield: village.rentalYield || 0,
        coverImage: village.coverImage || "",
        galleryImages: village.galleryImages || [],
        googleMapsUrl: village.googleMapsUrl || "",
        latitude: village.latitude || null,
        longitude: village.longitude || null,
        amenities: village.amenities || [],
      });
    }
  }, [isOpen, village, reset]);

  const coverImage = watch("coverImage");
  const galleryImages = watch("galleryImages") as (File | string)[];

  // Object URL previews mapping
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (coverImage instanceof File) {
      const url = URL.createObjectURL(coverImage);
      setCoverPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setCoverPreviewUrl((coverImage as string) || null);
    }
  }, [coverImage]);

  useEffect(() => {
    const urls = galleryImages.map((img) => {
      if (img instanceof File) {
        return URL.createObjectURL(img);
      }
      return img;
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
      showErrorToast(formLanguage === "ar" ? "الحد الأقصى لمعرض الصور هو 5 صور" : "Maximum 5 gallery images allowed");
      return;
    }
    setValue("galleryImages", [...currentImages, ...files], { shouldValidate: true });
  };

  const removeGalleryImage = (index: number) => {
    const newImages = [...galleryImages];
    newImages.splice(index, 1);
    setValue("galleryImages", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: any) => {
    if (!village) return;
    try {
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

      // If new coverImage file uploaded
      if (data.coverImage instanceof File) {
        formData.append("coverImage", data.coverImage);
      }

      // Add gallery images (files + existing kept urls)
      if (data.galleryImages) {
        data.galleryImages.forEach((img: any) => {
          if (img instanceof File) {
            formData.append("galleryImages", img);
          } else if (typeof img === "string") {
            formData.append("galleryImages", img);
          }
        });
      }

      await onUpdate(formData);
      showSuccessToast(isArabic ? "تم تعديل القرية بنجاح" : "Village updated successfully.");
      onClose();
    } catch (err: any) {
      showErrorToast(err?.data?.message || (isArabic ? "فشل تعديل القرية" : "Failed to update village."));
    }
  };

  const amenitiesOptions = useMemo(() => {
    return ALLOWED_AMENITIES.map((item) => ({
      label: isArabic ? item.ar : item.en,
      value: item.value,
    }));
  }, [isArabic]);

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
            dir={isArabic ? "rtl" : "ltr"}
            className="relative z-10 flex h-full w-full flex-col bg-[#F5F9FA] shadow-2xl sm:max-w-[580px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#C0C4C8] bg-[#F5F9FA]">
              <div className="flex flex-col gap-1 items-start">
                <h2 className="text-[23px] font-medium text-text-secondary">
                  {t.title}
                </h2>
              </div>
              <div className="flex items-center gap-4">
                {/* Language switcher */}
                <div className="flex items-center bg-[#EDEFF2] p-1 rounded-lg border border-[#C0C4C8]">
                  <button
                    type="button"
                    onClick={() => setFormLanguage("en")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      !isArabic ? "bg-[#1E8CAB] text-white shadow-xs" : "text-text-darker hover:text-text-secondary"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormLanguage("ar")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      isArabic ? "bg-[#1E8CAB] text-white shadow-xs" : "text-text-darker hover:text-text-secondary"
                    }`}
                  >
                    العربية
                  </button>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center p-2 rounded-xl text-text-darker hover:bg-[#EDEFF2] hover:text-text-secondary transition-colors"
                  aria-label="Close"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
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
                  <span>{isArabic ? "يرجى تصحيح أخطاء التحقق أدناه" : "Please correct validation errors below"}</span>
                </div>
              )}

              {/* Village Name - English & Arabic Side-by-Side */}
              <div className="flex flex-col gap-4 border-b border-[#EDEFF2] pb-5">
                <span className="text-sm font-semibold text-text-secondary">
                  {isArabic ? "اسم القرية" : "Village Name"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t.nameEn}
                    placeholder="e.g. Porto Golf"
                    required
                    {...register("name.en")}
                    error={errors.name?.en?.message}
                  />
                  <Input
                    label={t.nameAr}
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
                  {isArabic ? "اسم المطور" : "Developer"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t.developerEn}
                    placeholder="e.g. Porto Developments"
                    required
                    {...register("developerName.en")}
                    error={errors.developerName?.en?.message}
                  />
                  <Input
                    label={t.developerAr}
                    placeholder="مثال: عامر جروب"
                    required
                    dir="rtl"
                    {...register("developerName.ar")}
                    error={errors.developerName?.ar?.message}
                  />
                </div>
              </div>

              {/* Location Text - English & Arabic Side-by-Side */}
              <div className="flex flex-col gap-4 border-b border-[#EDEFF2] pb-5">
                <span className="text-sm font-semibold text-text-secondary">
                  {isArabic ? "تفاصيل الموقع" : "Location Info"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t.locationEn}
                    placeholder="e.g. Kilo 120, Alamein"
                    required
                    {...register("locationText.en")}
                    error={errors.locationText?.en?.message}
                  />
                  <Input
                    label={t.locationAr}
                    placeholder="مثال: الكيلو 120، العلمين"
                    required
                    dir="rtl"
                    {...register("locationText.ar")}
                    error={errors.locationText?.ar?.message}
                  />
                </div>
              </div>

              {/* Price and Yield */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#EDEFF2] pb-5">
                <Input
                  label={t.startingPrice}
                  type="number"
                  placeholder={t.placeholderPrice}
                  required
                  {...register("startingPrice")}
                  error={errors.startingPrice?.message}
                />
                <Input
                  label={t.rentalYield}
                  type="number"
                  step="any"
                  placeholder={t.placeholderYield}
                  required
                  {...register("rentalYield")}
                  error={errors.rentalYield?.message}
                />
              </div>

              {/* Maps and Coordinates */}
              <div className="flex flex-col gap-4 border-b border-[#EDEFF2] pb-5">
                <span className="text-sm font-semibold text-text-secondary">
                  {isArabic ? "خرائط وإحداثيات الموقع (اختياري)" : "Maps & Coordinates (Optional)"}
                </span>
                <Input
                  label={t.googleMapsUrl}
                  type="text"
                  placeholder={t.placeholderUrl}
                  {...register("googleMapsUrl")}
                  error={errors.googleMapsUrl?.message}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t.latitude}
                    type="number"
                    step="any"
                    placeholder={t.placeholderLat}
                    {...register("latitude")}
                    error={errors.latitude?.message}
                  />
                  <Input
                    label={t.longitude}
                    type="number"
                    step="any"
                    placeholder={t.placeholderLng}
                    {...register("longitude")}
                    error={errors.longitude?.message}
                  />
                </div>
              </div>

              {/* Amenities Multi-select */}
              <div className="border-b border-[#EDEFF2] pb-5">
                <Controller
                  control={control}
                  name="amenities"
                  render={({ field: { value, onChange } }) => (
                    <MultiSelectDropdown
                      label={t.amenities}
                      placeholder={isArabic ? "اختر المرافق والخدمات" : "Select amenities"}
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
                  {t.coverImage} <span className="text-primary">*</span>
                </label>
                <div
                  onClick={() => !coverPreviewUrl && coverInputRef.current?.click()}
                  className={`group relative bg-white border border-[#D4D5D8] border-dashed rounded-lg h-[166px] flex flex-col items-center justify-center overflow-hidden transition-all ${
                    !coverPreviewUrl ? "cursor-pointer hover:border-[#1E8CAB]" : ""
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
                          {t.replace}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-text-darker py-4">
                      <FiUpload className="w-8 h-8 text-[#747474]" />
                      <span className="text-xs font-normal">{t.uploadNew}</span>
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
                  <span className="text-xs text-red-500 mt-1">{errors.coverImage.message}</span>
                )}
              </div>

              {/* Gallery Images Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">
                  {t.galleryImages}
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
                      <span className="text-[10px] text-text-darker mt-1">{t.uploadNew}</span>
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
                  <span className="text-xs text-red-500 mt-1">{errors.galleryImages.message}</span>
                )}
              </div>

              {/* Submit Button invisible helper */}
              <button type="submit" className="hidden" />
            </form>

            {/* Footer Actions */}
            <div className="flex justify-end items-center gap-4 px-6 py-5 border-t border-[#C0C4C8] bg-[#F5F9FA]">
              <Button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                variant="icon"
                className="flex h-12 w-auto items-center justify-center p-2 rounded-xl text-[#1e8cab] text-base font-medium hover:bg-[#EDEFF2] transition-colors disabled:opacity-50"
              >
                {t.cancel}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                isLoading={isLoading}
                disabled={isLoading}
                variant="modalPrimary"
                className="h-12 rounded-xl px-6 bg-[#1e8cab] hover:bg-[#156d85]"
              >
                {t.saveChanges}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
