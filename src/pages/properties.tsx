import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiArrowUpRight } from "react-icons/fi";
import { mockProperties } from "../data";
import EmptyState from "../components/Ui/EmptyState";
import Button from "../components/Ui/Button";
import type { Property } from "../interface/property";

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [propertiesList] = useState<Property[]>(() => {
    const saved = localStorage.getItem("porto_properties");
    return saved ? JSON.parse(saved) : mockProperties;
  });

  const filteredProperties = useMemo(() => {
    return propertiesList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, propertiesList]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative flex items-center w-full sm:max-w-xs">
          <FiSearch className="absolute left-3 w-[18px] h-[18px] text-text-naturalGray pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search properties..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-white text-text-secondary placeholder:text-text-naturalGray focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white flex flex-col gap-[20px] p-[16px] rounded-[20px] shadow-[0px_2px_6.3px_1px_rgba(0,0,0,0.14)] w-full"
            >
              {/* Media banner */}
              <div className="h-[158px] rounded-[4px] w-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-text-darker text-sm font-medium">No Image</span>
                )}
              </div>

              {/* Text info */}
              <div className="flex flex-col gap-[12px] items-start w-full">
                <div className="flex items-center justify-between w-full gap-2">
                  <h4 className="font-medium text-[19px] text-[#141414] leading-none truncate">
                    {property.name}
                  </h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-text-secondary shrink-0">
                    {property.listingType}
                  </span>
                </div>

                <div className="flex items-center justify-between w-full text-sm">
                  <div className="flex flex-col gap-[4px]">
                    <span className="text-[#464646] text-xs">Village</span>
                    <span className="font-semibold text-text-secondary">{property.village}</span>
                  </div>
                  <div className="flex flex-col gap-[4px] text-right">
                    <span className="text-[#464646] text-xs">Price</span>
                    <span className="font-bold text-[#141414]">{property.price || "1.5M"}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-[#EDEFF2]">
                <span className={`inline-block py-1 px-3 rounded-full text-xs font-medium text-white ${
                  property.status === "Available" ? "bg-green-600" : property.status === "Pending" ? "bg-amber-500" : "bg-red-600"
                }`}>
                  {property.status}
                </span>

                <Button
                  variant="outlinePrimary"
                  rightIcon={<FiArrowUpRight className="w-4 h-4 shrink-0" />}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="!h-9 text-xs"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-16">
          <EmptyState
            message={
              searchQuery
                ? `No properties found for "${searchQuery}".`
                : "No properties listed yet."
            }
          />
        </div>
      )}
    </div>
  );
}