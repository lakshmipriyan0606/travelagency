import React, { useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { filterConfig } from "./constant";

interface MobilePanelProps {
  control: any;
  onClose: () => void;
  handleClear: () => void;
  appliedByGroup: Record<string, number>;
  packageMode?: string;
}

export const MobileFilterPanel: React.FC<MobilePanelProps> = ({ control, onClose, handleClear, appliedByGroup, packageMode = "all" }) => {
  const filteredConfigKeys = useMemo(() => {
    return Object.keys(filterConfig).filter((group) => {
      if (packageMode === 'packages' && group === 'activities') return false;
      return true;
    });
  }, [packageMode]);

  const [activeTab, setActiveTab] = useState<string>(filteredConfigKeys[0]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }} className="fixed right-0 top-0 h-full w-[85vw] max-w-[360px] z-50 bg-white flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="font-semibold text-gray-800">Filters</span>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 cursor-pointer"><X size={20} /></button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[42%] bg-gray-50 border-r border-gray-100 overflow-y-auto">
            {filteredConfigKeys.map((group) => (
              <button key={group} onClick={() => setActiveTab(group)} className={`relative w-full text-left px-3 py-4 text-sm capitalize transition-colors flex items-center justify-between cursor-pointer ${activeTab === group ? "font-semibold text-primary bg-white" : "text-gray-600 hover:bg-white/60"}`}>
                <span className="leading-snug">{group.replace(/([A-Z])/g, " $1").trim()}</span>
                {(appliedByGroup[group] ?? 0) > 0 && <span className="text-[10px] bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center font-bold ml-1 flex-shrink-0">{appliedByGroup[group]}</span>}
                {activeTab === group && <motion.span layoutId="mobile-tab-indicator" className="absolute left-0 top-0 w-0.5 h-full bg-primary rounded-r" transition={{ type: "spring", stiffness: 250, damping: 24 }} />}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.12 }} className="flex flex-col gap-1">
                {(filterConfig[activeTab as keyof typeof filterConfig] as readonly string[])?.map((value) => {
                  const id = `mobile-${activeTab}-${value}`;
                  return (
                    <div key={value} className="border-b border-gray-100 last:border-0">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <Controller name={`filterConfig.${activeTab}.${value}`} control={control} render={({ field }) => <input id={id} type="checkbox" checked={field.value || false} onChange={(e) => field.onChange(e.target.checked)} className="cursor-pointer w-4 h-4 accent-primary" />} />
                          <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">{value}</label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="border-t border-gray-100 p-3 flex gap-3">
          <button onClick={handleClear} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">Clear All</button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer">Apply</button>
        </div>
      </motion.div>
    </>
  );
};
