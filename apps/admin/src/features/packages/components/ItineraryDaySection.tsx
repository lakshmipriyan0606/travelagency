"use client";
import { useFieldArray } from "react-hook-form";
import { ReusableInput } from "@travelagency/forms";
import { SlotFieldSection } from "./SlotFieldSection";
import { Trash2, Plus } from "lucide-react";

interface ItineraryDaySectionProps {
  control: any;
  dayIndex: number;
  removeDay: (index: number) => void;
}

export const ItineraryDaySection = ({
  control,
  dayIndex,
  removeDay,
}: ItineraryDaySectionProps) => {
  const {
    fields: slotFields,
    append: addSlot,
    remove: removeSlot,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.slots`,
  });

  return (
    <div className="relative border border-white/[0.08] rounded-[20px] p-6 mb-4 bg-[var(--ent-card,#18181c)] shadow-[0_8px_28px_rgba(0,0,0,0.35)] group transition-all animate-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-[#F8B400] text-[#0c0c0f] rounded-xl flex items-center justify-center font-bold text-sm">
            {dayIndex + 1}
          </div>
          <div className="flex-1 md:min-w-[280px]">
            <ReusableInput
              control={control}
              name={`days.${dayIndex}.dayTitle`}
              label="Day Roadmap Title"
              required
              appearance="dark"
              mainContainerClassName="mb-0"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => removeDay(dayIndex)}
          className="w-9 h-9 rounded-lg bg-red-500/15 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          title="Remove Day"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4 ml-0 md:ml-5 pl-0 md:pl-8 border-l-0 md:border-l-2 border-dashed border-white/[0.08] relative">
        {slotFields.map((slot, slotIndex) => (
          <div key={slot.id} className="relative">
             <div className="absolute top-8 -left-[35px] w-[12px] h-[2px] bg-white/[0.1] hidden md:block" />
             <div className="absolute top-7 -left-[46px] w-5 h-5 bg-[var(--ent-card,#18181c)] border-4 border-white/[0.1] rounded-full hidden md:block" />
             <SlotFieldSection
               control={control}
               dayIndex={dayIndex}
               slotIndex={slotIndex}
               removeSlot={removeSlot}
             />
          </div>
        ))}

        <div className="pt-2">
          <button
            type="button"
            onClick={() =>
              addSlot({ slotType: "", title: "", description: "", imageUrl: "", imageAlt: "" })
            }
            className="group/btn flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white/[0.04] text-zinc-400 hover:bg-[#F8B400]/10 hover:text-[#F8B400] border border-white/[0.08] transition-all font-bold text-[9px] uppercase tracking-widest"
          >
            <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center group-hover/btn:bg-[#F8B400] group-hover/btn:text-[#0c0c0f] transition-colors">
               <Plus size={12} />
            </div>
            <span>New Activity Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
