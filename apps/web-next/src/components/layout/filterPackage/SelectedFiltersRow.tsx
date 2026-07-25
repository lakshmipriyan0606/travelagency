import { X } from "lucide-react";
import { FilterState } from "./constant";

interface SelectedFiltersProps {
  filters: FilterState;
  onRemove: (group: string, value: string) => void;
  onClearAll: () => void;
}

export const SelectedFiltersRow: React.FC<SelectedFiltersProps> = ({ filters, onRemove, onClearAll }) => {
  const activeTags: { group: string; value: string }[] = [];
  Object.entries(filters.filterConfig ?? {}).forEach(([group, values]) => {
    Object.entries(values).forEach(([val, checked]) => {
      if (checked) activeTags.push({ group, value: val });
    });
  });
  if (filters.city) activeTags.push({ group: "city", value: filters.city });

  if (!activeTags.length) return null;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="w-full border-t-2 border-dotted border-gray-300"></div>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">Selected Filters</span>
          <div className="flex flex-wrap gap-2">
            {activeTags.map(({ group, value }) => (
              <span
                key={`${group}-${value}`}
                className="flex items-center gap-1 bg-primary text-white text-[10px] xl:text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest"
              >
                {value}
                <button type="button" onClick={() => onRemove(group, value)} className="ml-1 hover:opacity-70 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="hidden md:block text-[10px] xl:text-xs font-bold text-gray-700 hover:text-red-500 transition-colors bg-[#FFE5E5] px-6 py-3 rounded-md whitespace-nowrap cursor-pointer uppercase tracking-[0.2em]"
        >
          CLEAR FILTERS
        </button>
      </div>
    </div>
  );
};
