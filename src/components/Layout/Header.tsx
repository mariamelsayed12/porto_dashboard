import { useLocation } from "react-router-dom";
import { FiMenu, FiPlus, FiChevronDown, FiTrash2, FiEdit3 } from "react-icons/fi";
import { useState } from "react";
import Button from "../Ui/Button";
import Breadcrumb from "../Ui/BreadCrumb";
import type { BreadcrumbItem } from "../Ui/BreadCrumb";
import { IoLockClosedOutline } from "react-icons/io5";
import { IoIosLogOut } from "react-icons/io";

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

  return (
    <header className="h-[72px] bg-white border-b border-border shadow-xs px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left side: Hamburger + Page Title / Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-text-darker hover:text-primary p-1.5 rounded-md hover:bg-light-gray transition-colors"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>

        {breadcrumbItems && breadcrumbItems.length > 0 ? (
          <Breadcrumb items={breadcrumbItems} />
        ) : (
          <h1 className="font-semibold text-[23px] text-text-secondary leading-none">
            {currentTitle}
          </h1>
        )}
      </div>

      {/* Right side: Action Buttons + User Profile */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* If generic details actions are present, render them */}
        {headerActions && headerActions.showActions ? (
          <div className="flex items-center gap-3">
            {/* Delete button (red trash bin) */}
            <Button
              variant="icon"
              onClick={headerActions.onDelete}
              className="flex items-center justify-center p-2 rounded-xl text-[#D7110E] hover:bg-red-50 transition-colors w-10 h-10 select-none active:scale-95"
              aria-label="Delete entity"
            >
              <FiTrash2 size={24} />
            </Button>
            {/* Edit button */}
            <Button
              variant="create"
              onClick={headerActions.onEdit}
              leftIcon={<FiEdit3 size={18} />}
              className="px-4 h-[36px] bg-[#1E8CAB] hover:bg-[#156D85] text-white"
            >
              {headerActions.editLabel || "Edit"}
            </Button>
          </div>
        ) : (
          <>
            {/* Villages Create Button */}
            {currentTitle === "Villages" && (
              <Button
                variant="create"
                onClick={onCreateClick}
                leftIcon={<FiPlus size={20} />}
                className="px-3 md:px-4"
              >
                <span>Create Village</span>
              </Button>
            )}

            {/* Overview / Overview Create Button */}
            {currentTitle === "Overview" && (
              <Button
                variant="create"
                onClick={onCreateClick}
                leftIcon={<FiPlus size={20} />}
                className="px-3 md:px-4"
              >
                <span>Create Property</span>
              </Button>
            )}

            {
              currentTitle === "Properties" && (
                 <Button
          variant="create"
          leftIcon={<FiPlus size={16} />}
          onClick={onCreateClick}
          id="create-property-btn"
          className="self-end xl:self-auto h-10 px-6 rounded-[12px]"
        >
          Add Property
        </Button>
              )
            }
          </>
        )}

        {/* Vertical Divider (Hidden on small mobile) */}
        <div className="hidden xs:block w-px h-8 bg-border" />

        {/* Profile Card */}
        <div className="relative">
          <div
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 md:gap-3 cursor-pointer select-none group py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-[#00236f] flex items-center justify-center text-white font-bold text-[12px] font-sans shrink-0 border border-slate-100 shadow-xs">
              MS
            </div>

            {/* User Text Stack (Hidden on tablet/mobile) */}
            <div className="hidden md:flex flex-col text-left justify-center w-[134px]">
              <span className="font-medium text-[14px] text-text-secondary leading-tight truncate group-hover:text-primary transition-colors">
                Mohamed Samy
              </span>
              <span className="font-normal text-[12px] text-text-darker leading-none mt-0.5">
                Admin
              </span>
            </div>

            {/* Chevron (Hidden on small mobile) */}
            <FiChevronDown
              size={18}
              className={`text-text-darker transition-transform duration-200 ${
                profileDropdownOpen ? "rotate-180" : ""
              } group-hover:text-text-secondary`}
            />
          </div>

          {/* Simple Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-[222px] bg-white rounded-md border border-border shadow-md py-1 z-50">
              <a
                href="#profile"
                className="flex items-center gap-2 px-4 py-2 text-[14px] text-text-secondary hover:bg-light-primary hover:text-primary transition-colors"
                onClick={() => setProfileDropdownOpen(false)}
              >
               <IoLockClosedOutline  size={24}/>

              Change Password
              </a>
              {/* <a
                href="#settings"
                className="block px-4 py-2 text-[14px] text-text-secondary hover:bg-light-primary hover:text-primary transition-colors"
                onClick={() => setProfileDropdownOpen(false)}
              >
                Account Settings
              </a> */}
              <hr className="my-1 border-border" />
              <button
                onClick={() => {
                  console.log("Logout clicked");
                  setProfileDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <IoIosLogOut size={24} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
