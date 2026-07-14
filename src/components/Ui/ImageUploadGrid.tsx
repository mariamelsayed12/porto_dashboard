import { useRef } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import Button from "./Button";

interface ImageUploadGridValue {
  cover: string | null;
  images: (string | null)[]; // exactly 4 items
}

interface ImageUploadGridProps {
  label?: string;
  required?: boolean;
  value: ImageUploadGridValue;
  onChange: (value: ImageUploadGridValue) => void;
  error?: string;
}

export default function ImageUploadGrid({
  label = "Media",
  required = false,
  value = { cover: null, images: [null, null, null, null] },
  onChange,
  error,
}: ImageUploadGridProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const subImageRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local URL for preview
    const previewUrl = URL.createObjectURL(file);

    if (type === "cover") {
      onChange({
        ...value,
        cover: previewUrl,
      });
    } else {
      const newImages = [...value.images];
      newImages[type] = previewUrl;
      onChange({
        ...value,
        images: newImages,
      });
    }
  };

  const handleRemoveImage = (type: "cover" | number) => {
    if (type === "cover") {
      onChange({
        ...value,
        cover: null,
      });
      if (coverInputRef.current) coverInputRef.current.value = "";
    } else {
      const newImages = [...value.images];
      newImages[type] = null;
      onChange({
        ...value,
        images: newImages,
      });
      if (subImageRefs[type].current) subImageRefs[type].current.value = "";
    }
  };

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Field Label */}
      <label className="text-base font-normal text-text-secondary select-none">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>

      {/* Grid Container */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        {/* Cover Slot */}
        <div className="flex flex-col gap-2 w-full sm:w-[294px]">
          <span className="text-sm font-medium text-text-secondary">
            cover<span className="text-primary ml-0.5">*</span>
          </span>
          <div
            onClick={() => !value.cover && coverInputRef.current?.click()}
            className={`group relative bg-white border border-[#D4D5D8] rounded-lg h-[166px] flex items-center justify-center overflow-hidden transition-all ${
              !value.cover ? "cursor-pointer hover:border-text-darker" : ""
            }`}
          >
            {value.cover ? (
              <>
                <img
                  src={value.cover}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage("cover");
                  }}
                  variant="icon"
                  className="absolute top-2 right-2 !bg-black/60 hover:!bg-black/80 text-white rounded-full !p-1.5 !w-7 !h-7 flex items-center justify-center transition-colors shadow-sm"
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-text-naturalGray group-hover:text-text-secondary transition-colors">
                <FiUpload className="w-6 h-6 text-[#747474]" />
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "cover")}
            />
          </div>
        </div>

        {/* 2x2 Sub-images */}
        <div className="flex-1 flex flex-col gap-2">
          <span className="text-sm font-medium text-transparent hidden sm:block select-none">
            Images
          </span>
          <div className="grid grid-cols-2 gap-3 w-full">
            {value.images.map((img, idx) => (
              <div key={idx} className="flex flex-col gap-2">
                <span className="text-sm font-medium text-text-secondary">
                  Img {idx + 1}
                </span>
                <div
                  onClick={() => !img && subImageRefs[idx].current?.click()}
                  className={`group relative bg-white border border-[#D4D5D8] rounded-lg h-[48px] flex items-center justify-center overflow-hidden transition-all ${
                    !img ? "cursor-pointer hover:border-text-darker" : ""
                  }`}
                >
                  {img ? (
                    <>
                      <img
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(idx);
                        }}
                        variant="icon"
                        className="absolute inset-0 !bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity !w-full !h-full !rounded-none"
                      >
                        <FiX className="w-6 h-6" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-text-naturalGray group-hover:text-text-secondary transition-colors">
                      <FiUpload className="w-5 h-5 text-[#747474]" />
                    </div>
                  )}
                  <input
                    ref={subImageRefs[idx]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, idx)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <span className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
}
