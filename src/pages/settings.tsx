import { useState, useEffect } from "react";
import { FiSave } from "react-icons/fi";
import Button from "../components/Ui/Button";
import Input from "../components/Ui/Input";
import PhoneInput from "../components/Settings/PhoneInput";
import { type CountryOption, countryOptions } from "../components/Settings/CountryCodeDropdown";

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

const INITIAL_SETTINGS: SettingsState = {
  phoneCountry: countryOptions[0], // Egypt (+20)
  phoneNumber: "1001234567",
  whatsappCountry: countryOptions[0], // Egypt (+20)
  whatsappNumber: "1001234567",
  companyEmail: "contact@porto.com",
  companyLocation: "Fifth Settlement, New Cairo, Egypt",
  tiktokLink: "https://tiktok.com/@porto.developments",
  facebookLink: "https://facebook.com/porto.developments",
  instagramLink: "https://instagram.com/porto.developments",
};

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsState>(INITIAL_SETTINGS);
  const [errors, setErrors] = useState<Partial<Record<keyof SettingsState, string>>>({});
  const [isSaving, setIsSaving] = useState(false);
  // const [saveSuccess, setSaveSuccess] = useState(false);
  // const [saveError, setSaveError] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("porto_company_settings");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
  }, []);

  const handleChange = (key: keyof SettingsState, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const handleCancel = () => {
    const saved = localStorage.getItem("porto_company_settings");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        setFormData(INITIAL_SETTINGS);
      }
    } else {
      setFormData(INITIAL_SETTINGS);
    }
    setErrors({});
    // setSaveError("");
    // setSaveSuccess(false);
  };

  const handleSave = (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();
    console.log("handleSave triggered. Form data:", formData);
    const newErrors: Partial<Record<keyof SettingsState, string>> = {};

    // Basic Validations
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    }
    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "Whatsapp number is required";
    }
    if (!formData.companyEmail.trim()) {
      newErrors.companyEmail = "Company email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.companyEmail)) {
      newErrors.companyEmail = "Invalid email format";
    }
    if (!formData.companyLocation.trim()) {
      newErrors.companyLocation = "Company location is required";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("Validation failed with errors:", newErrors);
      setErrors(newErrors);
      // setSaveError("Please fix the errors before saving.");
      // setSaveSuccess(false);
      return;
    }

    console.log("Validation passed. Saving settings...");
    setIsSaving(true);
    // setSaveError("");
    // setSaveSuccess(false);

    // Simulate API request
  //   setTimeout(() => {
  //     try {
  //       localStorage.setItem("porto_company_settings", JSON.stringify(formData));
  //       // setSaveSuccess(true);
  //       setIsSaving(false);
  //       // Auto dismiss success alert after 3 seconds
  //       setTimeout(() => setSaveSuccess(false), 3000);
  //     } catch (err) {
  //       setSaveError("Failed to save changes. Please try again.");
  //       setIsSaving(false);
  //     }
  //   }, 1000);
  // };
  }
  return (
    <div className="w-full">
      {/* Action Status Notification */}
      {/* {saveSuccess && (
        <div className="mb-6 flex items-center gap-2.5 rounded-md bg-[#EDF6EB] p-4 text-sm text-[#141414] border border-green-200 shadow-sm animate-fade-in">
          <FiCheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium">Changes saved successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="mb-6 flex items-center gap-2.5 rounded-md bg-[#FDE7E7] p-4 text-sm text-[#141414] border border-red-200 shadow-sm">
          <FiAlertCircle className="w-5 h-5 text-[#D7110E] shrink-0" />
          <span className="font-medium">{saveError}</span>
        </div>
      )} */}

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
            <PhoneInput
              label="Phone Number"
              required
              countryValue={formData.phoneCountry}
              onCountryChange={(val) => handleChange("phoneCountry", val)}
              phoneValue={formData.phoneNumber}
              onPhoneChange={(val) => handleChange("phoneNumber", val)}
              error={errors.phoneNumber}
            />
            <PhoneInput
              label="Whatsapp Number"
              required
              countryValue={formData.whatsappCountry}
              onCountryChange={(val) => handleChange("whatsappCountry", val)}
              phoneValue={formData.whatsappNumber}
              onPhoneChange={(val) => handleChange("whatsappNumber", val)}
              error={errors.whatsappNumber}
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
                value={formData.companyEmail}
                onChange={(e) => handleChange("companyEmail", e.target.value)}
                error={errors.companyEmail}
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
                value={formData.companyLocation}
                onChange={(e) => handleChange("companyLocation", e.target.value)}
                error={errors.companyLocation}
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
                type="url"
                placeholder="Input text"
                value={formData.tiktokLink}
                onChange={(e) => handleChange("tiktokLink", e.target.value)}
                error={errors.tiktokLink}
                variant="modal"
                size="md"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-base text-text-secondary select-none font-normal">
                Facebook link
              </label>
              <Input
                type="url"
                placeholder="Input text"
                value={formData.facebookLink}
                onChange={(e) => handleChange("facebookLink", e.target.value)}
                error={errors.facebookLink}
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
              type="url"
              placeholder="Input text"
              value={formData.instagramLink}
              onChange={(e) => handleChange("instagramLink", e.target.value)}
              error={errors.instagramLink}
              variant="modal"
              size="md"
              containerClassName="w-full"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end items-center mt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-12 px-6 text-primary hover:text-[#156d85] font-medium text-base transition-colors duration-200 cursor-pointer disabled:opacity-50 select-none rounded-md"
          >
            Cancel
          </button>
          <Button
            type="submit"
            onClick={handleSave}
            variant="modalPrimary"
            isLoading={isSaving}
            leftIcon={<FiSave size={20} />}
            className="bg-primary hover:bg-[#156d85] rounded-md h-12 px-6 font-medium text-white flex items-center justify-center gap-2 select-none"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
