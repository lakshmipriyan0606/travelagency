import React from "react";
import { motion } from "framer-motion";
import { SORT_OPTIONS, SortOption } from "./constant";

interface SortPopupProps {
  value: SortOption;
  onChange: (val: SortOption) => void;
  onClose: () => void;
}

export const SortPopup: React.FC<SortPopupProps> = ({ value, onChange, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-2xl border border-gray-100 min-w-[200px] overflow-hidden"
    >
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { onChange(opt.value); onClose(); }}
          className={`w-full flex items-center gap-3 px-5 py-3 text-sm text-left transition-colors cursor-pointer
            ${value === opt.value ? "bg-primary/10 text-primary font-semibold" : "text-gray-700 hover:bg-gray-50"}
          `}
        >
          <span className="w-4 text-center text-base">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
};
