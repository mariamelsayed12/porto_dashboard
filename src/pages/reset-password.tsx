import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";

import Input from "../components/Ui/Input";
import Button from "../components/Ui/Button";
import logoUrl from "../assets/Logo.svg";
import loginHeroUrl from "../assets/login.png";
import { resetSchema } from "../validation";

// Validation schema using Yup

type ResetPasswordFormInputs = yup.InferType<typeof resetSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormInputs>({
    resolver: yupResolver(resetSchema) as any,
    defaultValues: {
     email:""
    },
  });

  const onSubmit = (data: ResetPasswordFormInputs) => {
    // Submit handler prepared for future backend/endpoint connection
    console.log("Reset password form submitted successfully:", data);
    alert("Password reset request submitted successfully! (Simulated)");
  };

  return (
    <div className="bg-[#f5f9fa] min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-10 font-sans select-none">
      {/* Centered card containing both the form and the hero image */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1392px] h-auto lg:h-[656px] gap-6">
        {/* Left Column: Form Card */}
        <div className="bg-white h-auto lg:h-[656px] w-full lg:w-[684px] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.11)] flex flex-col justify-center items-center py-12 px-6 sm:px-12 md:px-[152px] shrink-0 relative">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="absolute left-6 top-[18px] h-9 px-4 py-2 border border-[#464646] hover:bg-slate-50 text-[#141414] text-[16px] font-medium rounded-[12px] flex items-center gap-2 cursor-pointer transition-colors duration-200"
          >
            <FiChevronLeft size={20} className="text-[#141414]" />
            Back
          </button>

          <div className="w-full max-w-[380px] flex flex-col gap-8 items-center mt-6 lg:mt-0">
            {/* Header: Logo and Title */}
            <div className="flex flex-col gap-4 items-center justify-center text-center">
              <div className="w-[56px] h-[56px] overflow-clip flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 items-center justify-center">
                <h1 className="font-poppins font-medium text-[23px] text-[#141414] tracking-normal leading-normal whitespace-nowrap">
                  Reset Password
                </h1>
                <p className="font-poppins font-normal text-[14px] text-[#464646] leading-normal">
                      Enter the following information to reset your password                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col gap-5"
            >
              {/* Current Password Input wrapper */}
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-[#141414] select-none">
                 Email
                  <span className="text-[#1E8CAB] ml-0.5">*</span>
                </label>
                <Input
                  type="email"
                  variant="login"
                  placeholder="enter your email"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* New Password Input wrapper */}
              {/* <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-[#141414] select-none">
                  New Password<span className="text-[#1E8CAB] ml-0.5">*</span>
                </label>
                <Input
                  type="password"
                  variant="login"
                  placeholder="••••••••"
                  showPasswordToggle
                  error={errors.newPassword?.message}
                  {...register("newPassword")}
                />
              </div> */}

              {/* Confirm Password Input wrapper */}
              {/* <div className="flex flex-col gap-1.5 w-full">
                <label className="text-sm font-medium text-[#141414] select-none">
                  Confirm New Password
                  <span className="text-[#1E8CAB] ml-0.5">*</span>
                </label>
                <Input
                  type="password"
                  variant="login"
                  placeholder="••••••••"
                  showPasswordToggle
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div> */}

              {/* Submit Button */}
              <div className="w-full mt-2">
                <Button type="submit" variant="login" isLoading={isSubmitting}>
                 Send  OTP
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Hero Image Card */}
        <div className="hidden lg:block h-[656px] w-[684px] rounded-[12px] relative shrink-0 overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.11)]">
          <img
            src={loginHeroUrl}
            alt="Porto Residence Villa"
            className="absolute inset-0 object-cover w-full h-full pointer-events-none rounded-[12px]"
          />
        </div>
      </div>
    </div>
  );
}
