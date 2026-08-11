import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import LatestPropertiesTableSkeleton from "./LatestPropertiesTableSkeleton";
import DataTable, { type ColumnDef, type ActionDef } from "./DataTable";
import DeleteModal from "./DeleteModal";
import defaultImage from "../../assets/default.png";
import { showSuccessToast, showErrorToast } from "./Toast";
import { useDeletePropertyMutation } from "../../../app/services/crudproperties";
import { DashboardOverviewApiSlice } from "../../../app/services/DashboardOverview";

interface LatestProperty {
  _id: string;
  name: string;
  listingType: string;
  status: string;
  installmentPrice: number;
  finishingStatus: string;
  deliveryDate: string;
  village: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
}

interface LatestPropertiesTableProps {
  properties: LatestProperty[];
  isLoading?: boolean;
  onEdit?: (property: LatestProperty) => void;
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyle = (s: string) => {
    switch (s.toLowerCase()) {
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
    <span className={`inline-block py-1.5 px-3 rounded-md text-[14px] font-medium whitespace-nowrap ${getStatusStyle(status)}`}>
      {status}
    </span>
  );
}

const columns: ColumnDef<any>[] = [
  {
    key: "createdAt",
    label: "Creation date",
    width: "w-[15%]",
    align: "center",
    render: (v) => (
      <span className="whitespace-nowrap text-text-darker font-medium">
        {v ? new Date(v as string).toLocaleDateString("en-GB") : "—"}
      </span>
    ),
  },
  {
    key: "name",
    label: "Property name",
    width: "w-[25%]",
    align: "left",
    render: (v) => (
      <span
        className="block max-w-[220px] truncate font-medium text-text-secondary"
        title={v as string}
      >
        {v as string}
      </span>
    ),
  },
  {
    key: "village",
    label: "Village",
    width: "w-[20%]",
    align: "center",
    render: (v) => (
      <span className="block max-w-[140px] truncate">
        {(v as any)?.name || "—"}
      </span>
    ),
  },
  {
    key: "listingType",
    label: "Listing type",
    width: "w-[18%]",
    align: "center",
    render: (v) => <span className="whitespace-nowrap">{v as string}</span>,
  },
  {
    key: "status",
    label: "Property status",
    width: "w-[15%]",
    align: "center",
    render: (v) => <StatusBadge status={v as string} />,
  },
];

export default function LatestPropertiesTable({ properties, isLoading, onEdit }: LatestPropertiesTableProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Delete modal states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<any | null>(null);

  const [deleteProperty, { isLoading: deleteLoading }] = useDeletePropertyMutation();

  const handleViewDetails = useCallback(
    (property: any) => navigate(`/properties/${property._id}`),
    [navigate]
  );

  const handleOpenDelete = useCallback((property: any) => {
    setPropertyToDelete(property);
    setIsDeleteOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!propertyToDelete) return;
    try {
      await deleteProperty(propertyToDelete._id).unwrap();
      showSuccessToast("Property deleted successfully.");
      setIsDeleteOpen(false);
      setPropertyToDelete(null);
      // Invalidate dashboard overview cache to refresh statistics and list
      dispatch(DashboardOverviewApiSlice.util.invalidateTags(["DashboardOverview"]));
    } catch (err: any) {
      showErrorToast(err?.data?.message || "Failed to delete property.");
    }
  }, [propertyToDelete, deleteProperty, dispatch]);

  const tableActions: ActionDef<any>[] = useMemo(
    () => [
      {
        key: "view",
        label: "View ",
        icon: <FiEye size={16} />,
        onClick: handleViewDetails,
      },
      {
        key: "edit",
        label: "Edit",
        icon: <FiEdit2 size={16} />,
        onClick: (row) => {
          if (onEdit) {
            onEdit(row);
          } else {
            navigate(`/properties/${row._id}`);
          }
        },
      },
      {
        key: "delete",
        label: "Delete ",
        icon: <FiTrash2 size={16} />,
        onClick: handleOpenDelete,
        className: "text-red-600",
      },
    ],
    [handleViewDetails, handleOpenDelete, navigate, onEdit]
  );

  if (isLoading) {
    return <LatestPropertiesTableSkeleton />;
  }

  return (
    <div className="w-full flex flex-col items-start rounded-md border border-border overflow-hidden bg-white">
      {/* Title Header */}
      <div className="w-full bg-white px-4 py-4 border-b border-border">
        <h3 className="font-medium text-[19px] text-text-darker">
          Latest properties
        </h3>
      </div>

      {/* Table Section */}
      <div className="w-full overflow-x-auto">
        <DataTable<any>
          columns={columns}
          data={properties}
          actions={tableActions}
          isLoading={isLoading}
          className="border-none rounded-none shadow-none"
          minWidth="700px"
        />
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        isLoading={deleteLoading}
        onClose={() => {
          setIsDeleteOpen(false);
          setPropertyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this property?"
        description="This action cannot be undone. All data associated with this property will be permanently removed."
        entityName={propertyToDelete?.name}
        entitySubText={propertyToDelete?.village?.name}
        entityImage={
          propertyToDelete?.coverImage ||
          (propertyToDelete?.images && propertyToDelete?.images[0]) ||
          defaultImage
        }
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}
