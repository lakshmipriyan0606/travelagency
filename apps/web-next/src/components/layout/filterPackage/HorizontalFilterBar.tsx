import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { filterConfig } from "./constant";

interface HorizontalFilterProps {
  control: any;
  appliedByGroup: Record<string, number>;
  packageMode?: string;
}

export const HorizontalFilterBar: React.FC<HorizontalFilterProps> = ({ control, appliedByGroup, packageMode = "all" }) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const toggleGroup = (group: string) => {
    if (activeGroup === group) setActiveGroup(null);
    else setActiveGroup(group);
  };

  return (
    <div className="hidden md:flex flex-col w-full mb-6 rounded-md overflow-hidden">
      <div className="flex items-center gap-4 flex-wrap px-4 xl:px-8 bg-white">
        {Object.entries(filterConfig)
          .filter(([group]) => {
            if (packageMode === 'packages' && group === 'activities') return false;
            return true;
          })
          .map(([group]) => {
            const count = appliedByGroup[group] ?? 0;
            const isActive = activeGroup === group;

            return (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs xl:text-[13px] tracking-widest uppercase transition-all relative cursor-pointer
                  ${isActive ? "text-gray-900 font-bold bg-[#EAEAEA] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]" : "text-gray-500 hover:text-gray-900"}
                `}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-opacity ${count > 0 ? "bg-primary opacity-100" : "opacity-0"}`}></span>
                <span>{group.replace(/([A-Z])/g, " $1").trim()}</span>
                {isActive ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
            );
          })}
      </div>

      <AnimatePresence>
        {activeGroup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden bg-[#EAEAEA] ml-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]"
          >
            <div className="px-4 xl:px-8 pb-6 pt-4 w-full flex flex-wrap gap-4">
              {(filterConfig[activeGroup as keyof typeof filterConfig] as readonly string[]).map((value) => {
                return (
                  <Controller
                    key={value}
                    name={`filterConfig.${activeGroup}.${value}`}
                    control={control}
                    render={({ field }) => {
                      const isSelected = field.value || false;
                      return (
                        <button
                          onClick={() => field.onChange(!isSelected)}
                          className={`px-6 py-2 rounded-full text-xs xl:text-sm tracking-widest uppercase transition-all border cursor-pointer
                            ${isSelected ? "bg-primary text-white border-primary" : "bg-white text-primary border-primary hover:bg-orange-50"}
                          `}
                        >
                          {value}
                        </button>
                      );
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
