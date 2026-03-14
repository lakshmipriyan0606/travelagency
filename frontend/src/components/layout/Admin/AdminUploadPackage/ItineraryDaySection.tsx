import { useFieldArray } from "react-hook-form";
import { ReusableInput } from "@/components/forms/ReusableInput";
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
    <div className="relative border border-neutral-200/60 rounded-3xl p-6 mb-4 bg-white shadow-xl shadow-neutral-100/50 group transition-all animate-in zoom-in-95 duration-500 hover:shadow-2xl hover:shadow-neutral-200/40">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 bg-neutral-800 text-white rounded-xl flex items-center justify-center font-bold shadow-md text-sm">
            {dayIndex + 1}
          </div>
          <div className="flex-1 md:min-w-[280px]">
            <ReusableInput
              control={control}
              name={`days.${dayIndex}.dayTitle`}
              label="Day Roadmap Title"
              required
              mainContainerClassName="mb-0"
            />
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => removeDay(dayIndex)}
          className="w-9 h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
          title="Remove Day"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-4 ml-0 md:ml-5 pl-0 md:pl-8 border-l-0 md:border-l-2 border-dashed border-neutral-100 relative">
        {slotFields.map((slot, slotIndex) => (
          <div key={slot.id} className="relative">
             <div className="absolute top-8 -left-[35px] w-[12px] h-[2px] bg-neutral-100 hidden md:block" />
             <div className="absolute top-7 -left-[46px] w-5 h-5 bg-white border-4 border-neutral-100 rounded-full hidden md:block" />
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
              addSlot({ slotType: "", title: "", description: "", imageUrl: "" })
            }
            className="group/btn flex items-center gap-2 py-2.5 px-5 rounded-xl bg-neutral-50 text-neutral-500 hover:bg-primary/10 hover:text-primary border border-neutral-100 transition-all font-bold text-[9px] uppercase tracking-widest shadow-sm"
          >
            <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-colors">
               <Plus size={12} />
            </div>
            <span>New Activity Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
