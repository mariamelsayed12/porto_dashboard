import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { mockVillages } from "../data";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import type { Village } from "../interface/village";
import type { BreadcrumbItem } from "../components/Ui/BreadCrumb";

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
        defaultValue: ["pool", "gym", "beach", "security", "parking"],
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
        defaultValue: "760 Market Street, San Francisco, CA 94107",
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
      <div className="w-full text-center py-20">
        <h2 className="text-2xl font-bold">Village Not Found</h2>
        <button
          onClick={() => navigate("/villages")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to Villages
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 bg-white p-6 sm:p-8 rounded-[20px] shadow-sm">
      {/* Cover Image Banner */}
      <div className="relative h-[250px] sm:h-[380px] w-full rounded-2xl overflow-hidden shrink-0">
        <img
          src={village.image}
          alt={village.name}
          className="w-full h-full object-cover"
        />
        {/* Cover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="absolute bottom-6 left-6 text-white flex flex-col gap-1">
          <h2 className="text-2xl sm:text-4xl font-bold font-poppins">
            {village.name}
          </h2>
          <p className="text-sm sm:text-base opacity-90 font-medium">
            by {village.developer}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Details column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#141414]">About the Village</h3>
            <p className="text-[#464646] leading-relaxed">
              Enjoy a premium lifestyle in {village.name}, developed by the prestigious {village.developer}. This high-end development features world-class amenities, stunning modern architectural designs, and scenic landscaped views. Conveniently located and offering outstanding investment returns, it represents a remarkable choice for homeowners and investors alike.
            </p>
          </div>

          <div className="h-px bg-[#EDEFF2]" />

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#141414]">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {["Pool", "Gym", "Beach Access", "24/7 Security", "Private Parking", "Restaurants", "Kids Play Area"].map((amenity) => (
                <span
                  key={amenity}
                  className="px-3.5 py-1.5 rounded-full bg-light-primary text-primary font-medium text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          <div className="h-px bg-[#EDEFF2]" />

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#141414]">Location & Neighbors</h3>
            <p className="text-[#464646] text-sm">
              Address: 760 Market Street, San Francisco, CA 94107
            </p>
            <div className="h-[200px] w-full rounded-xl overflow-hidden border border-border relative">
              <img
                src="http://localhost:3845/assets/fd881645eb39bb214d3b2d6fab51d737327727a9.png"
                alt="Map Location"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-[40%] left-[45%] bg-[#0f0f14]/90 text-white text-xs px-3 py-1.5 rounded-lg border border-border shadow-lg">
                📍 760 Market Street
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats sidebar card */}
        <div className="bg-[#f5f9fa] border border-border rounded-2xl p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-lg font-semibold text-[#141414]">Key Information</h3>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#747474] font-medium uppercase tracking-wider">Starting Price</span>
            <span className="text-2xl font-bold text-[#141414]">{village.startingPrice}</span>
          </div>

          <div className="h-px bg-[#EDEFF2]" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#747474] font-medium uppercase tracking-wider">Rental Yield</span>
            <span className="text-xl font-semibold text-primary">7.5%</span>
          </div>

          <div className="h-px bg-[#EDEFF2]" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#747474] font-medium uppercase tracking-wider">Available Properties</span>
            <span className="text-xl font-semibold text-[#141414]">{village.availableProperties} units</span>
          </div>

          <button
            onClick={() => navigate("/villages")}
            className="mt-2 w-full py-3 rounded-xl border border-[#747474] text-[#1e8cab] font-medium hover:bg-slate-100 transition-colors text-center text-sm"
          >
            Back to Villages
          </button>
        </div>
      </div>

      <FormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Village"
        fields={editFormFields}
        onSubmit={handleEditSubmit}
        submitText="Save Changes"
        cancelText="Cancel"
      />

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
