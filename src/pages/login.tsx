import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiMail, FiLock } from "react-icons/fi";

import Input from "../components/Ui/Input";
import Button from "../components/Ui/Button";
import logoUrl from "../assets/Logo.svg";
import loginHeroUrl from "../assets/login.png";

// Validation schema using Yup
const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: yup
    .string()
    .required("Password is required"),
  rememberMe: yup.boolean().default(false),
});

type LoginFormInputs = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginFormInputs) => {
    // Demonstration submit action (no backend/API logic as requested)
    console.log("Login form submitted successfully:", data);
    alert(`Form submitted successfully! Email: ${data.email}`);
  };

  return (
    <div className="bg-[#f5f9fa] min-h-screen w-full flex items-center justify-center p-4 md:p-6 lg:p-10 font-sans select-none">
      {/* Centered card containing both the form and the hero image */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1392px] h-auto lg:h-[656px] gap-6">
        
        {/* Left Column: Login Card */}
        <div className="bg-white h-auto lg:h-[656px] w-full lg:w-[684px] rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.11)] flex flex-col justify-center items-center py-10 px-6 sm:px-12 md:px-[152px] shrink-0">
          <div className="w-full max-w-[380px] flex flex-col gap-[48px] items-center">
            
            {/* Header: Logo and Title */}
            <div className="flex flex-col gap-6 items-center justify-center">
              <div className="w-[56px] h-[56px] overflow-clip flex items-center justify-center">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="font-poppins font-medium text-[23px] text-[#141414] tracking-normal leading-normal whitespace-nowrap">
                Welcome back
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
              
              {/* Email Input wrapper */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-medium text-[#141414] select-none">
                  Email<span className="text-[#1E8CAB] ml-0.5">*</span>
                </label>
                <Input
                  type="email"
                  variant="login"
                  placeholder="agent@email.com"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* Password Input wrapper */}
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm font-medium text-[#141414] select-none">
                  Password<span className="text-[#1E8CAB] ml-0.5">*</span>
                </label>
                <div className="flex flex-col w-full relative">
                  <Input
                    type="password"
                    variant="login"
                    placeholder="••••••••"
                    showPasswordToggle
                    error={errors.password?.message}
                    {...register("password")}
                  />
                </div>
              </div>

              {/* Remember Me and Forgot Password Container */}
              <div className="flex items-center justify-between w-full -mt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#1E8CAB] focus:ring-[#1E8CAB] w-4 h-4 cursor-pointer"
                    {...register("rememberMe")}
                  />
                  <span className="text-[13px] font-inter text-[#464646]">Remember me</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Forgot password clicked");
                  }}
                  className="text-[13px] font-inter font-normal text-[#1e8cab] hover:underline"
                >
                  Forgot password ?
                </a>
              </div>

              {/* Submit Button */}
              <div className="w-full mt-2">
                <Button
                  type="submit"
                  variant="login"
                  isLoading={isSubmitting}
                >
                  Login
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
