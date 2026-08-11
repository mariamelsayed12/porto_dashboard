import { useState, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FiMapPin } from "react-icons/fi";
import QuickAction from "../components/Ui/QuickAction";
import KpiCard from "../components/Ui/KpiCard";
import LatestPropertiesTable from "../components/Ui/LatestPropertiesTable";
import HomeIcon from "../icons/homeicon";
import TrueHomeIcon from "../icons/TrueHomeIcon";
import XHomeIcon from "../icons/XHomeIcon";
import SearchIcon from "../icons/SearchIcon";
import AddPropertyIcon from "../icons/AddPropertyIcon";
import BeachIcon from "../icons/BeachIcon";
import { useGetDashboardOverviewQuery, DashboardOverviewApiSlice } from "../../app/services/DashboardOverview";
import PropertyDistributionChart from "../components/Ui/PropertyDistributionChart";
import PropertyFormDrawer from "../components/Properties/PropertyFormDrawer";
import { useUpdatePropertyMutation } from "../../app/services/crudproperties";



export default function HomePage() {
  const { data: dashboardData ,isLoading } = useGetDashboardOverviewQuery();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { setIsCreateOpen } = useOutletContext<{
    setIsCreateOpen: (open: boolean) => void;
  }>();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<any | null>(null);
  const [updateProperty, { isLoading: isUpdateLoading }] = useUpdatePropertyMutation();

  const handleEditSubmit = useCallback(async (formData: FormData) => {
    if (!propertyToEdit) return;
    await updateProperty({ id: propertyToEdit._id, body: formData }).unwrap();
    dispatch(DashboardOverviewApiSlice.util.invalidateTags(["DashboardOverview"]));
    setIsEditOpen(false);
    setPropertyToEdit(null);
  }, [propertyToEdit, updateProperty, dispatch]);

  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      {/* 1. Quick Actions Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickAction
          title="Find Property"
          description="Search and manage existing listings."
          Icon={SearchIcon}
          iconColor="text-[#1E8CAB]"
          onClick={() => navigate("/properties")}
        />
        <QuickAction
          title="Add Property"
          description="Create a new listing and publish it."
          Icon={AddPropertyIcon}
          iconColor="text-[#E07A5F]"
          onClick={() => {
            setIsCreateOpen(true);
            navigate("/properties");
          }}
        />
        <QuickAction
          title="Add Village"
          description="Manage compounds and destinations."
          Icon={BeachIcon}
          iconColor="text-[#F2CC8F]"
          onClick={() => {
            setIsCreateOpen(true);
            navigate("/villages");
          }}
        />
      </section>

      {/* 2. KPI Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
        isLoading={isLoading}
          title="Total Properties"
          value={dashboardData?.totalProperties ?? 0}
          Icon={HomeIcon}
        />
        <KpiCard
          isLoading={isLoading}
          title="Active Listing"
          value={
            (dashboardData?.propertiesByStatus?.["Available"] ?? 0) +
            (dashboardData?.propertiesByStatus?.["Available Soon"] ?? 0)
          }
          subtext="Available & available soon"
          Icon={TrueHomeIcon}
        />
        <KpiCard
          isLoading={isLoading}
          title="Inactive Listing"
          value={
            (dashboardData?.propertiesByStatus?.["Sold Out"] ?? 0) +
            (dashboardData?.propertiesByStatus?.["Not Available"] ?? 0)
          }
          subtext="Sold out & rented"
          Icon={XHomeIcon}
        />
        <KpiCard
          isLoading={isLoading}
          title="Total Villages"
          value={dashboardData?.totalVillages ?? 0}
          Icon={FiMapPin}
        />
      </section>

      {/* 3. Columns Section (Table + Chart) */}
      <section className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Table */}
        <div className="w-full lg:flex-1 min-w-0">
          <LatestPropertiesTable
            properties={dashboardData?.latestProperties ?? []}
            isLoading={isLoading}
            onEdit={(property) => {
              setPropertyToEdit(property);
              setIsEditOpen(true);
            }}
          />
        </div>

        {/* Right Side: Chart */}
        <div className="w-full lg:w-[413px] min-w-0">
          <PropertyDistributionChart
            data={dashboardData?.villagesWithPropertyCount ?? []}
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* ── Edit Drawer ───────────────────────────────────────────────────── */}
      <PropertyFormDrawer
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setPropertyToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={isUpdateLoading}
        mode="edit"
        propertyId={propertyToEdit?._id}
      />
    </div>
  );
}