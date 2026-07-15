import  { useEffect, useRef, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import type { ActionDropdownProps } from "../../interface";
import ActionDropdownItem from "./ActionDropdownItem";


const ActionDropdown = <T,>({
  row,
  actions,
}: ActionDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);



  return (
    <div
      ref={dropdownRef}
      className="relative inline-flex"
    >

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          flex items-center justify-center
          w-8 h-8
          rounded-md
          hover:bg-gray-100
          transition-colors
        "
      >
        <HiOutlineDotsVertical
          size={20}
          className="text-gray-600"
        />
      </button>



      {/* Dropdown */}
      <AnimatePresence>

        {isOpen && (

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: -5,
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}

            exit={{
              opacity: 0,
              scale: 0.95,
              y: -5,
            }}

            transition={{
              duration: 0.15,
            }}

            className="
              absolute
              right-0
              top-full
              mt-2
              min-w-[180px]
              bg-white
              border
              border-gray-200
              rounded-lg
              shadow-lg
              z-50
              overflow-hidden
              py-1
            "
          >

            {actions.map((action) => (

              <ActionDropdownItem
                key={action.key}
                action={action}
                row={row}
                onClose={() => setIsOpen(false)}
              />

            ))}


          </motion.div>

        )}

      </AnimatePresence>


    </div>
  );
};


export default ActionDropdown;