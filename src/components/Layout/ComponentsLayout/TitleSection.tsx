"use client";
import { motion } from "framer-motion";
import { FiChevronDown } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const TitleSection = ({ open }: { open: boolean }) => {


  const navigate = useNavigate();
  const goToHome = () => {
    navigate("/pages/pagesofsidebar/Home");
  };
  return (
    <div className="mb-3 border-b border-slate-300 pb-3">
      <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100">
        <div className="flex items-center gap-2">
          <MdDashboard size={30} />
          {open && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.125 }}
            >
              <span
                className="block text-[28px] font-semibold"
                onClick={goToHome}
              >
                Dashboard
              </span>
            </motion.div>
          )}
        </div>
        {open && <FiChevronDown className="mr-2" size={24} />}
      </div>
    </div>
  );
};

export default TitleSection;
