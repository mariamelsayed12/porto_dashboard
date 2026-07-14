"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import {FiMap } from "react-icons/fi";
import { FaChalkboardTeacher, FaThLarge, FaUsers } from "react-icons/fa";
import Option from "./Option";
import ToggleClose from "./Toggle";
import TitleSection from "./TitleSection";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <motion.nav
      layout
      className="sticky mt-10 pt-7 top-0 min-h-screen shrink-0 border-r border-slate-300 bg-white p-1"
      style={{
        width: open ? "225px" : "fit-content",
      }}
    >
      <TitleSection open={open} />

      <div className="space-y-1">
        <Option
          Icon={FaUsers}
          title="Member"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/overview"
        />
        <Option
          Icon={FiMap}
          title="Tracks"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/properties"
        />
        <Option
          Icon={FaChalkboardTeacher}
          title="Stages"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/villages"

        />
        <Option
          Icon={FaThLarge}
          title="Category"
          selected={selected}
          setSelected={setSelected}
          open={open}
          path="/settings"
        />
        
      </div>

      <ToggleClose open={open} setOpen={setOpen} />
    </motion.nav>
  );
};

export default Sidebar;
