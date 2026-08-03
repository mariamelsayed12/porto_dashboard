import * as yup from "yup";

export const resetSchema = yup.object().shape({
  email: yup
     .string()
     .required("Email is required")
     .email("Please enter a valid email address")
    
//   newPassword: yup
//     .string()
//     .required("New password is required")
//     .min(6, "Password must be at least 6 characters"),
//   confirmPassword: yup
//     .string()
//     .required("Confirm password is required")
//     .oneOf([yup.ref("newPassword")], "Passwords must match"),
});


export const validationSchema = yup.object().shape({
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

export const propertyValidationSchema = yup.object().shape({
  name: yup.object().shape({
    en: yup.string().trim().min(2, "Must be at least 2 characters").max(150, "Cannot exceed 150 characters").required("Required"),
    ar: yup.string().trim().min(2, "Must be at least 2 characters").max(150, "Cannot exceed 150 characters").required("Required"),
  }),
  description: yup.object().shape({
    en: yup.string().trim().min(10, "Must be at least 10 characters").required("Required"),
    ar: yup.string().trim().min(10, "Must be at least 10 characters").required("Required"),
  }),
  village: yup.string().required("Village is required"),
  listingType: yup.string().oneOf(["Developer", "Resale", "Rent"], "Invalid listing type").required("Required"),
  status: yup.string().oneOf(["Available", "Sold Out", "Available Soon", "Not Available"], "Invalid status").required("Required"),
  paymentModel: yup.string().oneOf(["Cash", "Installments", "Both"], "Invalid payment model").required("Required"),
  area: yup.number().typeError("Must be a positive number").positive("Must be greater than 0").required("Required"),
  bedrooms: yup.number().typeError("Must be a non-negative integer").integer("Must be an integer").min(0, "Cannot be negative").required("Required"),
  bathrooms: yup.number().typeError("Must be a non-negative integer").integer("Must be an integer").min(0, "Cannot be negative").required("Required"),
  finishingStatus: yup.string().oneOf(["Not Finished", "Semi Finished", "Finished", "Fully Furnished"], "Invalid finishing status").required("Required"),
  orientation: yup.string().trim().max(100, "Cannot exceed 100 characters").required("Required"),
  propertyType: yup.string().trim().required("Property type is required"),
  coverImage: yup.mixed().required("Cover image is required").test("fileType", "Only JPEG, PNG, or WEBP images are accepted", (value) => {
    if (!value) return false;
    if (typeof value === "string") return true;
    if (value instanceof File) {
      return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type);
    }
    return false;
  }).test("fileSize", "Cover image too large. Max 1.5MB", (value) => {
    if (value instanceof File) {
      return value.size <= 1.5 * 1024 * 1024;
    }
    return true;
  }),
  images: yup.array().of(
    yup.mixed().test("fileType", "Only JPEG, PNG, or WEBP images are accepted", (value) => {
      if (!value) return false;
      if (typeof value === "string") return true;
      if (value instanceof File) {
        return ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(value.type);
      }
      return false;
    }).test("fileSize", "Gallery image too large. Max 1MB", (value) => {
      if (value instanceof File) {
        return value.size <= 1 * 1024 * 1024;
      }
      return true;
    })
  ).max(4, "Maximum 4 gallery images allowed").optional().default([]),
  isFeatured: yup.string().oneOf(["Yes", "No"]).optional().default("No"),
  deliveryDate: yup.string().optional().nullable(),
  availableUnits: yup.number().typeError("Must be an integer >= 0").integer("Must be an integer").min(0, "Cannot be negative").optional().default(1),
  installmentPrice: yup.number().typeError("Must be a number").min(0, "Cannot be negative").optional().nullable().transform((value, originalValue) => originalValue === "" ? null : value),
  downPaymentPercentage: yup.number().typeError("Must be a number").min(0, "Cannot be negative").max(100, "Cannot exceed 100").optional().nullable().transform((value, originalValue) => originalValue === "" ? null : value),
  downPaymentAmount: yup.number().typeError("Must be a number").min(0, "Cannot be negative").optional().nullable().transform((value, originalValue) => originalValue === "" ? null : value),
  installmentPeriod: yup.string().optional().default(""),
  installmentValue: yup.number().typeError("Must be a number").min(0, "Cannot be negative").optional().nullable().transform((value, originalValue) => originalValue === "" ? null : value),
  amenities: yup.array().of(yup.string().required()).optional().default([]),
});



// Validation Schema using Yup
export const settingsSchema = yup.object().shape({
  phoneCountry: yup.object().required() as any,
  phoneNumber: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  whatsappCountry: yup.object().required() as any,
  whatsappNumber: yup
    .string()
    .trim()
    .required("Whatsapp number is required")
    .matches(/^\d+$/, "Whatsapp number must contain only digits"),
  companyEmail: yup
    .string()
    .trim()
    .required("Company email is required")
    .email("Invalid email format"),
  companyLocation: yup.string().trim().required("Company location is required"),
  tiktokLink: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "is-url",
      "Must be a valid URL",
      (value) => !value || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)
    ),
  facebookLink: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "is-url",
      "Must be a valid URL",
      (value) => !value || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)
    ),
  instagramLink: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test(
      "is-url",
      "Must be a valid URL",
      (value) => !value || /^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)
    ),
});