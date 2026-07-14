import { useLocation } from "react-router-dom";
import { FiMenu, FiPlus, FiChevronDown } from "react-icons/fi";
import { useState } from "react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
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
        // Capitalize route name
        const segment = pathname.substring(1);
        return segment.charAt(0).toUpperCase() + segment.slice(1);
    }
  };

  return (
    <header className="h-[72px] bg-white border-b border-border shadow-xs px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Left side: Hamburger (mobile/tablet only) + Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-text-darker hover:text-primary p-1.5 rounded-md hover:bg-light-gray transition-colors"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </button>
        <h1 className="font-semibold text-[23px] text-text-secondary leading-none">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Right side: Action Button + Divider + User Profile */}
      <div className="flex items-center gap-4 md:gap-5">
        {/* Create Property CTA */}
        <button
          onClick={() => console.log("Create Property clicked")}
          className="bg-primary hover:bg-[#156d85] active:scale-95 text-white h-[36px] flex items-center justify-center gap-1.5 px-3 md:px-4 rounded-md transition-all font-medium text-[16px] shadow-xs"
        >
          <FiPlus size={20} className="shrink-0" />
          <span className="hidden xs:inline">Create Property</span>
        </button>

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
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md border border-border shadow-md py-1 z-50">
              <a
                href="#profile"
                className="block px-4 py-2 text-[14px] text-text-secondary hover:bg-light-primary hover:text-primary transition-colors"
                onClick={() => setProfileDropdownOpen(false)}
              >
                My Profile
              </a>
              <a
                href="#settings"
                className="block px-4 py-2 text-[14px] text-text-secondary hover:bg-light-primary hover:text-primary transition-colors"
                onClick={() => setProfileDropdownOpen(false)}
              >
                Account Settings
              </a>
              <hr className="my-1 border-border" />
              <button
                onClick={() => {
                  console.log("Logout clicked");
                  setProfileDropdownOpen(false);
                }}
                className="w-full text-left block px-4 py-2 text-[14px] text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
