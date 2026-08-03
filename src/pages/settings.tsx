import { useState, useEffect } from "react";
import { FiSave, FiEdit2 } from "react-icons/fi";
import { Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Button from "../components/Ui/Button";
import Input from "../components/Ui/Input";
import PhoneInput from "../components/Settings/PhoneInput";
import { type CountryOption, countryOptions } from "../components/Settings/CountryCodeDropdown";
import { useViewEditForm } from "../hooks/useViewEditForm";
import { showSuccessToast, showErrorToast } from "../components/Ui/Toast";
import { settingsSchema } from "../validation";
import { axiosInstance } from "../config/axios.config";

interface SettingsState {
  phoneCountry: CountryOption;
  phoneNumber: string;
  whatsappCountry: CountryOption;
  whatsappNumber: string;
  companyEmail: string;
  companyLocation: string;
  tiktokLink: string;
  facebookLink: string;
  instagramLink: string;
}

const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { country: countryOptions[0], number: "" };
  const matchedCountry = countryOptions.find((c) => fullPhone.startsWith(c.code));
  if (matchedCountry) {
    return {
      country: matchedCountry,
      number: fullPhone.slice(matchedCountry.code.length),
    };
  }
  return { country: countryOptions[0], number: fullPhone };
};

const INITIAL_SETTINGS: SettingsState = {
  phoneCountry: countryOptions[0], // Egypt (+20)
  phoneNumber: "",
  whatsappCountry: countryOptions[0], // Egypt (+20)
  whatsappNumber: "",
  companyEmail: "",
  companyLocation: "",
  tiktokLink: "",
  facebookLink: "",
  instagramLink: "",
};

const getProfileSettings = (profile: any): SettingsState => {
  const parsedPhone = parsePhoneNumber(profile?.phone || "");
  const parsedWhatsapp = parsePhoneNumber(profile?.whatsapp || "");

  return {
    phoneCountry: parsedPhone.country,
    phoneNumber: parsedPhone.number || "",
    whatsappCountry: parsedWhatsapp.country,
    whatsappNumber: parsedWhatsapp.number || "",
    companyEmail: profile?.email || "",
    companyLocation: profile?.companyLocation || "",
    tiktokLink: profile?.tiktok || "",
    facebookLink: profile?.facebook || "",
    instagramLink: profile?.instagram || "",
  };
};

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // Profile React state initialized from localStorage
  const [profile, setProfile] = useState(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    return user?.data?.user || null;
  });

  const dynamicInitialSettings = getProfileSettings(profile);

  const handleSaveSettings = async (data: SettingsState) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      const payload = {
        email: data.companyEmail,
        phone: `${data.phoneCountry.code}${data.phoneNumber}`,
        whatsapp: `${data.whatsappCountry.code}${data.whatsappNumber}`,
        companyLocation: data.companyLocation,
        tiktok: data.tiktokLink,
        facebook: data.facebookLink,
        instagram: data.instagramLink,
      };

      const res = await axiosInstance.patch(
        "/admin/profile",
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (res.status === 200) {
        const responseData = res.data;
        const updatedUserFields = responseData?.data?.user || responseData?.data || responseData?.user || payload;
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
        const updatedUser = {
          ...currentUser,
          data: {
            ...currentUser.data,
            user: {
              ...currentUser.data?.user,
              ...updatedUserFields,
            }
          }
        };
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
        
        // Update local React state to trigger UI update
        setProfile(updatedUser.data.user);
        
        // Dispatch custom event to sync with Header/other components in real-time
        window.dispatchEvent(new Event("user-profile-updated"));

        showSuccessToast("Settings saved successfully.");
      } else {
        showErrorToast("Failed to save settings.");
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err?.message || "Failed to save settings.";
      showErrorToast(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const { isEditMode, enableEdit, cancelEdit, form, handleSave } = useViewEditForm<SettingsState>({
    defaultValues: dynamicInitialSettings,
    resolver: yupResolver(settingsSchema) as any,
    onSave: handleSaveSettings,
  });

  // Synchronize form with localStorage profile on mount or state changes
  useEffect(() => {
    form.reset(getProfileSettings(profile));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, form]);

  return (
    <div className="w-full">
      {/* Main Form Card */}
      <form
        onSubmit={handleSave}
        className="bg-white border border-[#D4D5D8] rounded-md p-5 md:p-8 flex flex-col gap-6 w-full shadow-xs"
      >
        {/* Section 1: Company Information */}
        <div className="flex flex-col gap-5">
          <h2 className="text-[23px] font-medium text-text-secondary leading-none">
            Company Information
          </h2>

          {/* Row 1: Phone & Whatsapp */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            <Controller
              name="phoneNumber"
              control={form.control}
              render={({ field }) => (
                <PhoneInput
                  label="Phone Number"
                  required
                  countryValue={form.watch("phoneCountry") || INITIAL_SETTINGS.phoneCountry}
                  onCountryChange={(val) => form.setValue("phoneCountry", val, { shouldValidate: true })}
                  phoneValue={field.value || ""}
                  onPhoneChange={field.onChange}
                  error={form.formState.errors.phoneNumber?.message}
                  disabled={!isEditMode}
                />
              )}
            />
            <Controller
              name="whatsappNumber"
              control={form.control}
              render={({ field }) => (
                <PhoneInput
                  label="Whatsapp Number"
                  required
                  countryValue={form.watch("whatsappCountry") || INITIAL_SETTINGS.whatsappCountry}
                  onCountryChange={(val) => form.setValue("whatsappCountry", val, { shouldValidate: true })}
                  phoneValue={field.value || ""}
                  onPhoneChange={field.onChange}
                  error={form.formState.errors.whatsappNumber?.message}
                  disabled={!isEditMode}
                />
              )}
            />
          </div>

          {/* Row 2: Email & Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-base text-text-secondary select-none font-normal">
                Company email
                <span className="text-primary ml-1">*</span>
              </label>
              <Input
                type="email"
                placeholder="Input text"
                {...form.register("companyEmail")}
                error={form.formState.errors.companyEmail?.message}
                disabled={!isEditMode}
                variant="modal"
                size="md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base text-text-secondary select-none font-normal">
                Company location
                <span className="text-primary ml-1">*</span>
              </label>
              <Input
                type="text"
                placeholder="Input text"
                {...form.register("companyLocation")}
                error={form.formState.errors.companyLocation?.message}
                disabled={!isEditMode}
                variant="modal"
                size="md"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#EDEFF2] my-2" />

        {/* Section 2: Social Media links */}
        <div className="flex flex-col gap-5">
          <h2 className="text-[23px] font-medium text-text-secondary leading-none">
            Social Media links
          </h2>

          {/* Row 3: Tiktok & Facebook */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-base text-text-secondary select-none font-normal">
                Tiktok link
              </label>
              <Input
                type="text"
                placeholder="Input text"
                {...form.register("tiktokLink")}
                error={form.formState.errors.tiktokLink?.message}
                disabled={!isEditMode}
                variant="modal"
                size="md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base text-text-secondary select-none font-normal">
                Facebook link
              </label>
              <Input
                type="text"
                placeholder="Input text"
                {...form.register("facebookLink")}
                error={form.formState.errors.facebookLink?.message}
                disabled={!isEditMode}
                variant="modal"
                size="md"
              />
            </div>
          </div>

          {/* Row 4: Instagram (Full Width) */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-text-secondary select-none font-normal">
              Instagram link
            </label>
            <Input
              type="text"
              placeholder="Input text"
              {...form.register("instagramLink")}
              error={form.formState.errors.instagramLink?.message}
              disabled={!isEditMode}
              variant="modal"
              size="md"
              containerClassName="w-full"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end items-center mt-4">
          {!isEditMode ? (
            <Button
              type="button"
              onClick={enableEdit}
              variant="modalPrimary"
              leftIcon={<FiEdit2 size={18} />}
              className="bg-primary hover:bg-[#156d85] rounded-md h-12 px-6 font-medium text-white flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              Edit Settings
            </Button>
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="h-12 px-6 text-primary hover:text-[#156d85] font-medium text-base transition-colors duration-200 cursor-pointer disabled:opacity-50 select-none rounded-md"
              >
                Cancel
              </button>
              <Button
                type="submit"
                variant="modalPrimary"
                isLoading={isSaving}
                leftIcon={<FiSave size={20} />}
                className="bg-primary hover:bg-[#156d85] rounded-md h-12 px-6 font-medium text-white flex items-center justify-center gap-2 select-none cursor-pointer"
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
