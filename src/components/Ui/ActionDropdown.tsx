import  { useEffect, useRef, useState } from "react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import type { ActionDropdownProps } from "../../interface";
import ActionDropdownItem from "./ActionDropdownItem";


const ActionDropdown = <T,>({
  row,
  actions,
  preferUp,
}: ActionDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"down" | "up">("down");

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

  // Determine dropdown orientation based on preferUp or viewport space below the button
  useEffect(() => {
    if (isOpen) {
      if (preferUp) {
        setDropdownPosition("up");
      } else if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        
        if (spaceBelow < 160) {
          setDropdownPosition("up");
        } else {
          setDropdownPosition("down");
        }
      }
    }
  }, [isOpen, preferUp]);



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
              y: dropdownPosition === "up" ? 5 : -5,
            }}

            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}

            exit={{
              opacity: 0,
              scale: 0.95,
              y: dropdownPosition === "up" ? 5 : -5,
            }}

            transition={{
              duration: 0.15,
            }}

            className={`
              absolute
              right-0
              ${dropdownPosition === "up" ? "bottom-full mb-2" : "top-full mt-2"}
              min-w-[180px]
              bg-white
              border
              border-gray-200
              rounded-lg
              shadow-lg
              z-50
              overflow-hidden
              py-1
            `}
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