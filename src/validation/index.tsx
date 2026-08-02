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
