import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { mockProperties } from "../data";
import FormDrawer from "../components/Ui/FormDrawer";
import DeleteModal from "../components/Ui/DeleteModal";
import type { BreadcrumbItem } from "../components/Ui/BreadCrumb";
import type { Property } from "../interface";

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

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { setBreadcrumbItems, setHeaderActions } = useOutletContext<LayoutContextType>();

  const [propertiesList, setPropertiesList] = useState<Property[]>(() => {
    const saved = localStorage.getItem("porto_properties");
    return saved ? JSON.parse(saved) : mockProperties;
  });

  const property = useMemo(() => {
    return propertiesList.find((p) => String(p.id) === String(id)) || null;
  }, [propertiesList, id]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (property) {
      setBreadcrumbItems([
        { label: "Properties", href: "/properties" },
        { label: `${property.name} Details` },
      ]);
      setHeaderActions({
        showActions: true,
        onEdit: () => setIsEditOpen(true),
        onDelete: () => setIsDeleteOpen(true),
        editLabel: "Edit Property",
      });
    } else {
      setBreadcrumbItems([
        { label: "Properties", href: "/properties" },
        { label: "Not Found" },
      ]);
      setHeaderActions(null);
    }

    return () => {
      setBreadcrumbItems([]);
      setHeaderActions(null);
    };
  }, [property, setBreadcrumbItems, setHeaderActions]);

  const editFormFields = useMemo(() => {
    if (!property) return [];
    return [
      {
        name: "name",
        label: "Property name",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: property.name,
      },
      {
        name: "village",
        label: "Village",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: property.village,
      },
      {
        type: "divider" as const,
        name: "div-1",
      },
      {
        name: "price",
        label: "Price",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: property.price || "1.5M",
      },
      {
        name: "listingType",
        label: "Listing Type",
        type: "text" as const,
        placeholder: "Input text",
        required: true,
        defaultValue: property.listingType,
      },
    ];
  }, [property]);

  const handleEditSubmit = (data: Record<string, any>) => {
    if (!property) return;
    const updatedList = propertiesList.map((p) =>
      String(p.id) === String(property.id)
        ? {
            ...p,
            name: data.name,
            village: data.village,
            price: data.price,
            listingType: data.listingType,
          }
        : p
    );

    setPropertiesList(updatedList);
    localStorage.setItem("porto_properties", JSON.stringify(updatedList));
    alert(`Success! Property updated.`);
    setIsEditOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!property) return;
    const updatedList = propertiesList.filter((p) => String(p.id) !== String(property.id));
    localStorage.setItem("porto_properties", JSON.stringify(updatedList));
    setIsDeleteOpen(false);
    navigate("/properties");
  };

  if (!property) {
    return (
      <div className="w-full text-center py-20">
        <h2 className="text-2xl font-bold">Property Not Found</h2>
        <button
          onClick={() => navigate("/properties")}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Back to Properties
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-8 bg-white p-6 sm:p-8 rounded-[20px] shadow-sm">
      {/* Banner */}
      <div className="relative h-[250px] sm:h-[350px] w-full rounded-2xl overflow-hidden shrink-0">
        {property.image ? (
          <img
            src={property.image}
            alt={property.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-text-darker">
            No Image Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        <div className="absolute bottom-6 left-6 text-white flex flex-col gap-1">
          <h2 className="text-2xl sm:text-4xl font-bold font-poppins">
            {property.name}
          </h2>
          <p className="text-sm sm:text-base opacity-90 font-medium">
            Village: {property.village}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#141414]">Description</h3>
            <p className="text-[#464646] leading-relaxed">
              This beautiful {property.listingType.toLowerCase()} listing offers luxury living in {property.village}. Ready with modern interiors and top tier features, it provides a high return potential and represents a premium real estate asset.
            </p>
          </div>

          <div className="h-px bg-[#EDEFF2]" />

          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-[#141414]">Status</h3>
            <div>
              <span className={`inline-block py-1.5 px-4 rounded-full font-medium text-sm text-white ${
                property.status === "Available" ? "bg-green-600" : property.status === "Pending" ? "bg-amber-500" : "bg-red-600"
              }`}>
                {property.status}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#f5f9fa] border border-border rounded-2xl p-6 flex flex-col gap-6 h-fit">
          <h3 className="text-lg font-semibold text-[#141414]">Price & Listing</h3>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#747474] font-medium uppercase tracking-wider">Price</span>
            <span className="text-2xl font-bold text-[#141414]">{property.price || "1.5M"}</span>
          </div>

          <div className="h-px bg-[#EDEFF2]" />

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#747474] font-medium uppercase tracking-wider">Listing Type</span>
            <span className="text-xl font-semibold text-primary">{property.listingType}</span>
          </div>

          <button
            onClick={() => navigate("/properties")}
            className="mt-2 w-full py-3 rounded-xl border border-[#747474] text-[#1e8cab] font-medium hover:bg-slate-100 transition-colors text-center text-sm"
          >
            Back to Properties
          </button>
        </div>
      </div>

      <FormDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Property"
        fields={editFormFields}
        onSubmit={handleEditSubmit}
        submitText="Save Changes"
        cancelText="Cancel"
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this property ?"
        entityName={property.name}
        entitySubText={property.village}
      />
    </div>
  );
}
