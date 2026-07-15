import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { mockVillages } from "../data";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import type { Village } from "../interface/index";
import type { BreadcrumbItem } from "../components/Ui/BreadCrumb";

import defaultImg from "../assets/default.png";

interface HeaderActionConfig {
  showActions: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
}

interface LayoutContextType {
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  setBreadcrumbItems: (items: BreadcrumbItem[]) => void;
  setHeaderActions: (actions: HeaderActionConfig | null) => void;
}

export default function VillageDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { setBreadcrumbItems, setHeaderActions } = useOutletContext<LayoutContextType>();

  const [villagesList, setVillagesList] = useState<Village[]>(() => {
    const saved = localStorage.getItem("porto_villages");
    return saved ? JSON.parse(saved) : mockVillages;
  });

  const village = useMemo(() => {
    return villagesList.find((v) => String(v.id) === String(id)) || null;
  }, [villagesList, id]);

  // Edit / Delete states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Sync breadcrumbs and header actions
  useEffect(() => {
    if (village) {
      setBreadcrumbItems([
        { label: "Villages", href: "/villages" },
        { label: `${village.name} Details` },
      ]);
      setHeaderActions({
        showActions: true,
        onEdit: () => setIsEditOpen(true),
        onDelete: () => setIsDeleteOpen(true),
        editLabel: "Edit Village",
      });
    } else {
      setBreadcrumbItems([
        { label: "Villages", href: "/villages" },
        { label: "Not Found" },
      ]);
      setHeaderActions(null);
    }

    return () => {
      setBreadcrumbItems([]);
      setHeaderActions(null);
    };
  }, [village, setBreadcrumbItems, setHeaderActions]);

  const editFormFields = useMemo(() => {
    if (!village) return [];
    return [
      {
        name: "name",
        label: "Village name",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: village.name,
      },
      {
        name: "developer",
        label: "Developer name",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: village.developer,
      },
      {
        type: "divider" as const,
        name: "div-1",
      },
      {
        name: "price",
        label: "Starting price",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: village.startingPrice,
      },
      {
        name: "rentalYield",
        label: "Rental yield",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: "7.5%",
      },
      {
        type: "divider" as const,
        name: "div-2",
      },
      {
        name: "amenities",
        label: "Amenities",
        type: "multiselect" as const,
        placeholder: "Select amenities",
        required: true,
        options: [
          { label: "Pool", value: "pool" },
          { label: "Gym", value: "gym" },
          { label: "Beach", value: "beach" },
          { label: "Security", value: "security" },
          { label: "Parking", value: "parking" },
          { label: "Restaurant", value: "restaurant" },
          { label: "Kids Area", value: "kids" },
        ],
        defaultValue: village.amenities || ["pool", "gym", "beach", "security", "parking"],
      },
      {
        type: "divider" as const,
        name: "div-3",
      },
      {
        name: "media",
        label: "Media",
        type: "image-upload" as const,
        required: true,
        defaultValue: {
          cover: village.image || null,
          images: [null, null, null, null],
        },
      },
      {
        type: "divider" as const,
        name: "div-4",
      },
      {
        name: "location",
        label: "Location",
        type: "location" as const,
        required: true,
        defaultValue: village.location || "760 Market Street, San Francisco, CA 94107",
      },
    ];
  }, [village]);

  const handleEditSubmit = (data: Record<string, any>) => {
    if (!village) return;
    const coverImage = data.media?.cover || village.image;
    
    const updatedList = villagesList.map((v) =>
      String(v.id) === String(village.id)
        ? {
            ...v,
            name: data.name,
            developer: data.developer,
            startingPrice: data.price || v.startingPrice,
            image: coverImage,
            location: data.location,
            amenities: data.amenities,
          }
        : v
    );

    setVillagesList(updatedList);
    localStorage.setItem("porto_villages", JSON.stringify(updatedList));
    alert(`Success! Village updated.`);
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!village) return;
    const updatedList = villagesList.filter((v) => String(v.id) !== String(village.id));
    localStorage.setItem("porto_villages", JSON.stringify(updatedList));
    setIsDeleteOpen(false);
    navigate("/villages");
  };

  if (!village) {
    return (
      <div className="w-full text-center py-20 bg-[#f5f9fa]">
        <h2 className="text-2xl font-bold font-poppins text-[#141414]">Village Not Found</h2>
        <button
          onClick={() => navigate("/villages")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-poppins font-medium hover:bg-[#156D85] transition-colors"
        >
          Back to Villages
        </button>
      </div>
    );
  }


  const startingPriceFormatted = village.startingPrice.toLowerCase().includes("egp") 
    ? village.startingPrice 
    : `${village.startingPrice} EGP`;

  return (
    <div className="w-full min-h-screen bg-[#f5f9fa] flex flex-col lg:flex-row gap-[24px] p-0 md:px-[32px] ">
      {/* Left content panel */}
      <div className="flex-1 flex flex-col gap-[24px] max-w-full lg:max-w-[845px]">
        {/* Header banner card */}
        <div className="bg-white border border-border border-solid rounded-md flex flex-col md:flex-row p-[24px] gap-[24px] w-full items-stretch">
          {/* Cover image banner container */}
          <div className="w-full md:w-[378px] h-[250px] md:h-auto rounded-md overflow-hidden shrink-0 relative">
            <img
              src={village.image}
              alt={village.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>

          {/* Details stack on right */}
          <div className="flex-1 flex flex-col gap-[24px] justify-between">
            {/* Header metadata */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <div className="flex items-center justify-between w-full gap-4 flex-wrap">
                <h2 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
                  {village.name}
                </h2>
                <span className="font-poppins font-normal text-[14px] text-[#464646]">
                  Last updated 2 days ago
                </span>
              </div>
              <p className="font-poppins font-medium text-[16px] text-[#464646] w-full">
                {village.developer}
              </p>
            </div>

            {/* Stats boxes grid (2x2 layout) */}
            <div className="grid grid-cols-2 gap-[16px] md:gap-[24px] w-full">
              {/* Box 1: Starting Price */}
              <div className="bg-[#edeff2] border border-border border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  Starting price
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414] truncate max-w-full">
                  {startingPriceFormatted}
                </span>
              </div>

              {/* Box 2: Properties */}
              <div className="bg-[#edeff2] border border-[#d4d5d8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  Properties
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414]">
                  {village.availableProperties || 24}
                </span>
              </div>

              {/* Box 3: Amenities Count */}
              <div className="bg-[#edeff2] border border-[#d4d5d8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  Amenities
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414]">
                  {village.amenities ? village.amenities.length : 8}
                </span>
              </div>

              {/* Box 4: Rental Yield */}
              <div className="bg-[#edeff2] border border-[#d4d5d8] border-solid rounded-[12px] p-[16px] flex flex-col gap-[4px] items-start justify-center">
                <span className="font-poppins font-normal text-[16px] text-[#464646]">
                  Rental yield
                </span>
                <span className="font-poppins font-medium text-[19px] text-[#141414]">
                  7%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities section card */}
        <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-[24px] flex flex-col gap-[24px] w-full">
          <h3 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
            Amenities
          </h3>
          <div className="flex flex-wrap gap-[16px] items-center w-full">
            {(village.amenities && village.amenities.length > 0 
              ? village.amenities.map(a => a.charAt(0).toUpperCase() + a.slice(1))
              : ["Pool", "Gym", "Beach Access", "24/7 Security", "Private Parking", "Restaurants", "Kids Play Area"]
            ).map((label, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#d4d5d8] border-solid px-[24px] py-[12px] rounded-[44px] select-none hover:bg-[#edeff2] transition-colors duration-150 cursor-default"
              >
                <p className="font-poppins font-medium text-[16px] text-[#464646] text-center leading-[normal]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Location Section Card */}
        <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] overflow-hidden w-full flex flex-col">
          <div className="h-[244px] w-full relative overflow-hidden shrink-0">
            <img
              src={defaultImg}
              alt="Location map coordinates"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-[24px] flex flex-col items-start w-full">
            <div className="flex flex-col gap-[8px] items-start leading-[normal] w-full">
              <h3 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
                Location
              </h3>
              <p className="font-poppins font-normal text-[16px] text-[#464646]">
                {village.location || "North coast, Egypt"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right gallery sidebar column */}
      <div className="bg-white border border-[#d4d5d8] border-solid rounded-[12px] p-[24px] flex flex-col gap-[24px] w-full lg:w-[411px] shrink-0">
        <h3 className="font-poppins font-medium text-[23px] text-[#141414] leading-none">
          Village Gallery
        </h3>
        <div className="flex flex-col gap-[24px] w-full">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-[153px] rounded-[12px] overflow-hidden relative w-full shrink-0 shadow-xs border border-border"
            >
              <img
                src={defaultImg}
                alt={`Gallery photo ${item}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Form Drawer (Edit Flow) */}
      <FormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Village"
        fields={editFormFields}
        onSubmit={handleEditSubmit}
        submitText="Save Changes"
        cancelText="Cancel"
      />

      {/* Delete Modal Confirmation overlay */}
      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this village ?"
        entityName={village.name}
        entitySubText={village.developer}
        entityImage={village.image}
      />
    </div>
  );
}
