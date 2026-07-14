import { FiMoreVertical } from "react-icons/fi";

interface Property {
  id: string | number;
  creationDate: string;
  name: string;
  village: string;
  listingType: string;
  status: "Available" | "Sold Out" | "Rented" | "Available Soon" | string;
}

interface LatestPropertiesTableProps {
  properties: Property[];
}

export default function LatestPropertiesTable({ properties }: LatestPropertiesTableProps) {
  // Status badge style helper
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-[#edf6eb] text-[#141414]";
      case "sold out":
        return "bg-[#fcedeb] text-[#141414]";
      case "rented":
        return "bg-[#ebf0fc] text-[#141414]";
      case "available soon":
        return "bg-[#fcf8eb] text-[#141414]";
      default:
        return "bg-light-gray text-text-darker";
    }
  };

  return (
    <div className="w-full flex flex-col items-start rounded-md border border-border overflow-hidden">
      {/* Title Header */}
      <div className="w-full bg-white px-4 py-4 border-b border-border">
        <h3 className="font-medium text-[19px] text-text-darker">
          Latest properties
        </h3>
      </div>

      {/* Table Shell with Horizontal Scroll for responsiveness */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse bg-white">
          {/* Table Head */}
          <thead>
            <tr className="bg-light-primary border-b border-border text-left">
              <th className="py-3 px-4 font-medium text-[14px] text-text-darker w-[15%]">
                Creation date
              </th>
              <th className="py-3 px-4 font-medium text-[14px] text-text-darker w-[25%]">
                Property name
              </th>
              <th className="py-3 px-4 font-medium text-[14px] text-text-darker w-[20%]">
                Village
              </th>
              <th className="py-3 px-4 font-medium text-[14px] text-text-darker w-[18%]">
                Listing type
              </th>
              <th className="py-3 px-4 font-medium text-[14px] text-text-darker w-[15%]">
                Property status
              </th>
              <th className="py-3 px-4 font-medium text-[14px] text-text-darker text-right w-[7%]">
                Actions
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-border">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-[#fcfdfe] transition-colors">
                <td className="py-4 px-4 font-medium text-[14px] text-text-secondary whitespace-nowrap">
                  {property.creationDate}
                </td>
                <td className="py-4 px-4 font-medium text-[14px] text-text-secondary truncate max-w-[180px]">
                  {property.name}
                </td>
                <td className="py-4 px-4 font-medium text-[14px] text-text-secondary truncate max-w-[140px]">
                  {property.village}
                </td>
                <td className="py-4 px-4 font-medium text-[14px] text-text-secondary whitespace-nowrap">
                  {property.listingType}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-block py-1.5 px-3 rounded-md text-[14px] font-medium ${getStatusStyle(property.status)}`}>
                    {property.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-text-darker hover:text-text-secondary p-1 rounded-full hover:bg-light-gray transition-colors">
                    <FiMoreVertical size={20} className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
