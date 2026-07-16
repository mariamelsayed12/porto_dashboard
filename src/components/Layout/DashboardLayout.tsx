import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PageContainer from "./PageContainer";
import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import type { BreadcrumbItem } from "../Ui/BreadCrumb";

interface HeaderActionConfig {
  showActions: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const location = useLocation();

  // Close create drawer when navigating to a new route
  useEffect(() => {
    setIsCreateOpen(false);
  }, [location.pathname]);

  // States for dynamic breadcrumbs and actions overrides
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([]);
  const [headerActions, setHeaderActions] = useState<HeaderActionConfig | null>(null);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-secondary">
      {/* Desktop Sidebar (Fixed on left, hidden on mobile/tablet) */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile/Tablet Sidebar Drawer Overlay (Slide-in from left) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden bg-white shadow-2xl flex"
            >
              <div className="relative h-full">
                {/* Close Button peeking out of drawer */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-[-44px] w-11 h-11 bg-white text-text-darker hover:text-primary flex items-center justify-center rounded-r-md border-y border-r border-border shadow-md active:scale-95 transition-all"
                  aria-label="Close menu"
                >
                  <FiX size={20} />
                </button>
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header/Topbar */}
        <Header
          onMenuToggle={() => setSidebarOpen(true)}
          onCreateClick={() => setIsCreateOpen(true)}
          breadcrumbItems={breadcrumbItems}
          headerActions={headerActions}
        />

        {/* Scrollable Page Body */}
        <PageContainer>
          <Outlet
            context={{
              isCreateOpen,
              setIsCreateOpen,
              setBreadcrumbItems,
              setHeaderActions,
            }}
          />
        </PageContainer>
      </div>
    </div>
  );
}
