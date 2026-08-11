import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiPlus,
  FiChevronDown,
  FiTrash2,
  FiEdit3,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import Button from "../Ui/Button";
import Breadcrumb from "../Ui/BreadCrumb";
import type { BreadcrumbItem } from "../Ui/BreadCrumb";
import { IoIosLogOut } from "react-icons/io";
import { axiosInstance } from "../../config/axios.config";
import { showErrorToast, showSuccessToast } from "../Ui/Toast";

interface HeaderActionConfig {
  showActions: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
}

interface HeaderProps {
  onMenuToggle: () => void;
  onCreateClick?: () => void;
  breadcrumbItems?: BreadcrumbItem[];
  headerActions?: HeaderActionConfig | null;
}

export default function Header({
  onMenuToggle,
  onCreateClick,
  breadcrumbItems = [],
  headerActions = null,
}: HeaderProps) {
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Dynamic Page Title
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case "/":
        return "Overview";
      case "/villages":
        return "Villages";
      case "/properties":
        return "Properties";
      case "/settings":
        return "Settings";
      default:
        const segment = pathname.substring(1).split("/")[0];
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  const currentTitle = getPageTitle(location.pathname);
  
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("loggedInUser") || "{}"));

  useEffect(() => {
    const handleUpdate = () => {
      setUser(JSON.parse(localStorage.getItem("loggedInUser") || "{}"));
    };
    window.addEventListener("user-profile-updated", handleUpdate);
    return () => window.removeEventListener("user-profile-updated", handleUpdate);
  }, []);
  

  const handleLogout = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const result = await axiosInstance.post(
          "/admin/logout",
          {},
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );
        if (result.status === 200) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("loggedInUser");
          setLoading(false);
          setProfileDropdownOpen(false);
          showSuccessToast("Logged out successfully");
          navigate("/login");
        } else {
          setLoading(false);
          showErrorToast("Failed to logout");
        }
      } catch (err: any) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("loggedInUser");
        setLoading(false);
        setProfileDropdownOpen(false);
        showSuccessToast("Logged out successfully");
        navigate("/login");
      }
    };

  return (
    <header className="h-[72px] bg-white border-b border-border shadow-xs px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left side: Hamburger + Page Title / Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-text-darker hover:text-primary p-1.5 rounded-md hover:bg-light-gray transition-colors shrink-0"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>

        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} />
        ) : (
          <h1 className="font-semibold text-[18px] sm:text-[23px] text-text-secondary leading-none truncate" title={currentTitle}>
            {currentTitle}
          </h1>
        )}
      </div>

      {/* Right side: Action Buttons + User Profile */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-5 shrink-0">
        {/* If generic details actions are present, render them */}
        {headerActions && headerActions.showActions ? (
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Delete button (red trash bin) */}
            <Button
              variant="icon"
              onClick={headerActions.onDelete}
              className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl text-[#D7110E] hover:bg-red-50 transition-colors w-8 h-8 sm:w-10 sm:h-10 select-none active:scale-95 shrink-0"
              aria-label="Delete entity"
            >
              <FiTrash2 className="size-[20px] sm:size-[24px]" />
            </Button>
            {/* Edit button */}
            <Button
              variant="create"
              onClick={headerActions.onEdit}
              leftIcon={<FiEdit3 className="size-[14px] sm:size-[18px]" />}
              className="px-2.5 sm:px-4 h-[32px] sm:h-[36px] bg-[#1E8CAB] hover:bg-[#156D85] text-white text-xs sm:text-sm rounded-lg sm:rounded-xl shrink-0"
            >
              <span className="hidden xs:inline">{headerActions.editLabel || "Edit"}</span>
            </Button>
          </div>
        ) : (
          <>
            {/* Villages Create Button */}
            {location.pathname === "/villages" && (
              <Button
                variant="create"
                onClick={onCreateClick}
                leftIcon={<FiPlus className="size-[16px] sm:size-[20px]" />}
                className="px-2.5 sm:px-4 h-[32px] sm:h-[36px] text-xs sm:text-sm rounded-lg sm:rounded-xl shrink-0"
              >
                Create Village
              </Button>
            )}

            {location.pathname === "/properties" && (
              <Button
                variant="create"
                leftIcon={<FiPlus className="size-[14px] sm:size-[16px]" />}
                onClick={onCreateClick}
                id="create-property-btn"
                className="self-end xl:self-auto h-[32px] sm:h-10 px-3 sm:px-6 rounded-lg sm:rounded-[12px] text-xs sm:text-sm shrink-0"
              >
                Create Property
              </Button>
            )}
          </>
        )}

        {/* Vertical Divider (Hidden on small mobile) */}
        <div className="hidden xs:block w-px h-8 bg-border" />

        {/* Profile Card */}
        <div className="relative shrink-0">
          <div
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 md:gap-3 cursor-pointer select-none group py-1.5 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
          >
            {/* Avatar Circle */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00236f] flex items-center justify-center text-white font-bold text-[10px] sm:text-[12px] font-sans shrink-0 border border-slate-100 shadow-xs">
              {getInitials(user?.data?.user?.name || "User")}
            </div>

            {/* User Text Stack (Hidden on tablet/mobile) */}
            <div className="hidden md:flex flex-col text-left justify-center w-[134px]">
              <span className="font-medium text-[14px] text-text-secondary leading-tight truncate group-hover:text-primary transition-colors">
               {user?.data?.user?.name || "User"}
              </span>
              <span className="font-normal text-[12px] text-text-darker leading-none mt-0.5">
                Admin
              </span>
            </div>

            {/* Chevron (Hidden on small mobile) */}
            <FiChevronDown
              size={18}
              className={`hidden xs:block text-text-darker transition-transform duration-200 ${
                profileDropdownOpen ? "rotate-180" : ""
              } group-hover:text-text-secondary`}
            />
          </div>

          {/* Simple Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[222px] bg-white rounded-md border border-border shadow-md py-1 z-50">
              
              <a
                href="/settings"
                className="block px-4 py-2 text-[14px] text-text-secondary hover:bg-light-primary hover:text-primary transition-colors"
                onClick={() => setProfileDropdownOpen(false)}
              >
                Account Settings
              </a>
              <hr className="my-1 border-border" />
              <button
                disabled={loading}
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <IoIosLogOut size={24} className={`w-6 h-6 shrink-0 ${loading ? "animate-spin" : "rotate-180"}`} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
