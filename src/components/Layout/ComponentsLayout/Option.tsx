import type { Dispatch, SetStateAction } from "react";
import type { IconType } from "react-icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";


const Option = ({
    Icon,
    title,
    selected,
    setSelected,
    open,
    notifs,
    path
    
  }: {
    Icon: IconType;
    title: string;
    selected: string;
    setSelected: Dispatch<SetStateAction<string>>;
    open: boolean;
    notifs?: number;
    path:string

  }) => {
    const navigate = useNavigate();

    
    return (
        <motion.button
        layout
        onClick={() =>{
            setSelected(title)
            navigate(path);
        }
            }
        className={`relative flex h-10 w-full gap-2 items-center rounded-md transition-colors ${selected === title ? "bg-[#C9B2E8] text-[#371F5A]" : "text-black hover:bg-[#C9B2E8]"}`}
        >
        <motion.div
            layout
            className="grid h-full  w-10 place-content-center text-lg"
        >
            <Icon  size={20}/>
        </motion.div>
        {open && (
            <motion.span
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.125 }}
            className="text-[20px] "
            >
            {title}
          </motion.span>
        )}
  
        {notifs && open && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            style={{ y: "-50%" }}
            transition={{ delay: 0.5 }}
            className="absolute right-2 top-1/2 size-4 rounded bg-[#C9B2E8] text-xs text-white"
          >
            {notifs}
          </motion.span>
        )}
      </motion.button>
    );
  };

  export default Option