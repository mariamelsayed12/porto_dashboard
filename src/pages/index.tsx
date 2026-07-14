import { FiSearch, FiFileText, FiMap, FiMapPin } from "react-icons/fi";
import QuickAction from "../components/Ui/QuickAction";
import KpiCard from "../components/Ui/KpiCard";
import LatestPropertiesTable from "../components/Ui/LatestPropertiesTable";
import PropertyDistributionChart from "../components/Ui/PropertyDistributionChart";
import HomeIcon from "../icons/homeicon";
import TrueHomeIcon from "../icons/TrueHomeIcon";
import XHomeIcon from "../icons/XHomeIcon";

// Mock Data for Table
const latestProperties = [
  {
    id: 1,
    creationDate: "04/11/2026",
    name: "Challet in golden bay",
    village: "Porto Golf",
    listingType: "Developer",
    status: "Available",
  },
  {
    id: 2,
    creationDate: "04/11/2026",
    name: "Challet in golden bay",
    village: "Porto Golf",
    listingType: "Developer",
    status: "Available",
  },
  {
    id: 3,
    creationDate: "04/11/2026",
    name: "Challet in golden bay",
    village: "Porto Golf",
    listingType: "Developer",
    status: "Available",
  },
  {
    id: 4,
    creationDate: "04/11/2026",
    name: "Challet in golden bay",
    village: "Porto Golf",
    listingType: "Developer",
    status: "Available",
  },
  {
    id: 5,
    creationDate: "04/11/2026",
    name: "Challet in golden bay",
    village: "Porto Golf",
    listingType: "Developer",
    status: "Available",
  },
];

// Mock Data for Chart
const chartData = [
  { village: "village 1", count: 18 },
  { village: "village 2", count: 25 },
  { village: "village 3", count: 32 },
  { village: "village 4", count: 20 },
  { village: "village 5", count: 42 },
  { village: "village 6", count: 15 },
];

export default function HomePage() {
  return (
    <div className="w-full flex flex-col gap-8 md:gap-10">
      {/* 1. Quick Actions Row */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <QuickAction
          title="Find Property"
          description="Search and manage existing listings."
          Icon={FiSearch}
          iconColor="text-[#1E8CAB]"
          onClick={() => console.log("Find Property clicked")}
        />
        <QuickAction
          title="Add Property"
          description="Create a new listing and publish it."
          Icon={FiFileText}
          iconColor="text-[#E07A5F]"
          onClick={() => console.log("Add Property clicked")}
        />
        <QuickAction
          title="Add Village"
          description="Manage compounds and destinations."
          Icon={FiMap}
          iconColor="text-[#F2CC8F]"
          onClick={() => console.log("Add Village clicked")}
        />
      </section>

      {/* 2. KPI Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Total Properties"
          value={100}
          Icon={HomeIcon}
        />
        <KpiCard
          title="Active Listing"
          value={100}
          subtext="Available & available soon"
          Icon={TrueHomeIcon}
        />
        <KpiCard
          title="Inactive Listing"
          value={100}
          subtext="Sold out & rented"
          Icon={XHomeIcon}
        />
        <KpiCard
          title="Total Villages"
          value={6}
          Icon={FiMapPin}
        />
      </section>

      {/* 3. Columns Section (Table + Chart) */}
      <section className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Table */}
        <div className="w-full lg:flex-1 shrink-0">
          <LatestPropertiesTable properties={latestProperties} />
        </div>

        {/* Right Side: Chart */}
        <div className="w-full lg:w-[413px] shrink-0">
          <PropertyDistributionChart data={chartData} />
        </div>
      </section>
    </div>
  );
}