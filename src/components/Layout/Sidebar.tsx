import { NavLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import logoUrl from "../../assets/LogoDashboard2.svg";


// Inline SVGs for dynamic styling with tailwind
const PerspectiveIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M11.9999 3.60845V20.4005M2.3999 12.0045H21.5999M18.9599 21.5999L4.5599 19.8008C3.3599 19.6808 2.3999 18.7213 2.3999 17.5218V6.48708C2.3999 5.28765 3.3599 4.32811 4.5599 4.20817L18.9599 2.40902C20.3999 2.28908 21.5999 3.36857 21.5999 4.68794V19.201C21.5999 20.6404 20.2799 21.7198 18.9599 21.48V21.5999Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


const LocationIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M16 10C16 7.79 14.21 6 12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10ZM10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12C10.9 12 10 11.1 10 10Z" fill="currentColor"/>
    <path d="M11.4201 21.8102C11.5901 21.9302 11.8001 22.0002 12.0001 22.0002C12.2001 22.0002 12.4101 21.9402 12.5801 21.8102C12.8801 21.5902 20.0301 16.4402 20.0001 9.99023C20.0001 5.58023 16.4101 1.99023 12.0001 1.99023C7.59009 1.99023 4.00009 5.58023 4.00009 9.99023C3.97009 16.4302 11.1201 21.5902 11.4201 21.8102ZM12.0001 4.00023C15.3101 4.00023 18.0001 6.69023 18.0001 10.0002C18.0201 14.4402 13.6101 18.4302 12.0001 19.7402C10.3901 18.4302 5.98009 14.4502 6.00009 10.0002C6.00009 6.69023 8.69009 4.00023 12.0001 4.00023Z" fill="currentColor"/>
  </svg>
);

const PropertiesIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.3812 10.875L18.75 9.24488V5.25C18.75 4.63125 18.2438 4.125 17.625 4.125H16.5C15.8812 4.125 15.375 4.63125 15.375 5.25V5.87212L13.125 3.62438C12.8179 3.33413 12.5366 3 12 3C11.4634 3 11.1821 3.33413 10.875 3.62438L3.61875 10.875C3.26775 11.2406 3 11.5073 3 12C3 12.6334 3.486 13.125 4.125 13.125H5.25V19.875C5.25 20.4938 5.75625 21 6.375 21H8.625C9.24632 21 9.75 20.4963 9.75 19.875V15.375C9.75 14.7562 10.2562 14.25 10.875 14.25H13.125C13.7438 14.25 14.25 14.7562 14.25 15.375V19.875C14.25 20.4963 14.1912 21 14.8125 21H17.625C18.2438 21 18.75 20.4938 18.75 19.875V13.125H19.875C20.514 13.125 21 12.6334 21 12C21 11.5073 20.7322 11.2406 20.3812 10.875Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M13.6763 4.31627C13.2488 2.56124 10.7512 2.56124 10.3237 4.31627C10.2599 4.57999 10.1347 4.82492 9.95831 5.03112C9.78194 5.23732 9.55938 5.39897 9.30874 5.50291C9.0581 5.60684 8.78646 5.65014 8.51592 5.62927C8.24538 5.60839 7.9836 5.52394 7.75187 5.38279C6.20832 4.44227 4.44201 6.20855 5.38254 7.75207C5.99006 8.74884 5.45117 10.0494 4.31713 10.325C2.56096 10.7514 2.56096 13.25 4.31713 13.6753C4.58093 13.7392 4.8259 13.8645 5.03211 14.041C5.23831 14.2175 5.39991 14.4402 5.50375 14.691C5.6076 14.9418 5.65074 15.2135 5.62968 15.4841C5.60862 15.7547 5.52394 16.0165 5.38254 16.2482C4.44201 17.7917 6.20832 19.558 7.75187 18.6175C7.98356 18.4761 8.24536 18.3914 8.51597 18.3704C8.78658 18.3493 9.05834 18.3924 9.30912 18.4963C9.5599 18.6001 9.7826 18.7617 9.95911 18.9679C10.1356 19.1741 10.2609 19.4191 10.3248 19.6829C10.7512 21.439 13.2499 21.439 13.6752 19.6829C13.7393 19.4192 13.8647 19.1744 14.0413 18.9684C14.2178 18.7623 14.4405 18.6008 14.6912 18.497C14.9419 18.3932 15.2135 18.35 15.4841 18.3709C15.7546 18.3919 16.0164 18.4764 16.2481 18.6175C17.7917 19.558 19.558 17.7917 18.6175 16.2482C18.4763 16.0165 18.3918 15.7547 18.3709 15.4842C18.35 15.2136 18.3932 14.942 18.497 14.6913C18.6008 14.4406 18.7623 14.2179 18.9683 14.0414C19.1744 13.8648 19.4192 13.7394 19.6829 13.6753C21.439 13.2489 21.439 10.7502 19.6829 10.325C19.4191 10.2611 19.1741 10.1358 18.9679 9.95928C18.7617 9.78278 18.6001 9.56007 18.4962 9.3093C18.3924 9.05853 18.3493 8.78677 18.3703 8.51617C18.3914 8.24556 18.4761 7.98376 18.6175 7.75207C19.558 6.20855 17.7917 4.44227 16.2481 5.38279C16.0164 5.52418 15.7546 5.60886 15.484 5.62992C15.2134 5.65098 14.9417 5.60784 14.6909 5.504C14.4401 5.40016 14.2174 5.23856 14.0409 5.03236C13.8644 4.82616 13.7391 4.58119 13.6752 4.3174L13.6763 4.31627Z" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const menuItems = [
    { name: "Overview", path: "/", Icon: PerspectiveIcon },
    { name: "Villages", path: "/villages", Icon: LocationIcon },
    { name: "Properties", path: "/properties", Icon: PropertiesIcon },
    { name: "Settings", path: "/settings", Icon: SettingsIcon },
     { name: "login", path: "/login", Icon: SettingsIcon },
  ];

  return (
    <aside className="w-[94px] h-full bg-white border-r border-border flex flex-col justify-between">
      {/* Sidebar Header: Logo Area */}
      <div className="h-[72px] shrink-0 border-b border-border flex items-center justify-center">
        <img
          src={logoUrl}
          className="h-10 w-[64px] object-contain hover:opacity-85 transition-opacity"
          alt="Porto"
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col py-6 items-center gap-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `w-full py-4 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 border-l-2 ${
                isActive
                  ? "bg-primary text-white border-primary"
                  : "text-text-darker border-transparent hover:bg-light-gray hover:text-primary"
              }`
            }
          >
            <item.Icon className="w-6 h-6 shrink-0" />
            <span className="text-[14px] font-normal leading-none text-center">
              {item.name.toLowerCase()}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer: Logout Area */}
      <div className="border-t border-border shrink-0 py-6">
        <button
          onClick={() => console.log("Logout triggered")}
          className="w-full flex flex-col items-center justify-center gap-1.5 py-4 text-text-darker hover:bg-red-50 hover:text-red-600 border-l-2 border-transparent transition-all"
        >
          <FiLogOut className="w-6 h-6 shrink-0 rotate-180" />
          <span className="text-[14px] font-normal leading-none text-center">
            logout
          </span>
        </button>
      </div>
    </aside>
  );
}
