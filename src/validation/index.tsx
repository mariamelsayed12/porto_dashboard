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
