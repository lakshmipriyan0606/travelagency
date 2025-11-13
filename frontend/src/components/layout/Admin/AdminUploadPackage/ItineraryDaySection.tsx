import { Button } from "@/components/ui/button";
import { useFieldArray } from "react-hook-form";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { SlotFieldSection } from "./SlotFieldSection";

interface ItineraryDaySectionProps {
  control: any;
  day: any;
  dayIndex: number;
  removeDay: (index: number) => void;
}

export const ItineraryDaySection = ({
  control,
  day,
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
    <div className="border rounded-lg p-4 mb-5 bg-gray-50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <ReusableInput
          control={control}
          name={`days.${dayIndex}.dayTitle`}
          label={`Day ${dayIndex + 1} Title`}
          required
          mainContainerClassName="mb-0"
        />
        <Button
          type="button"
          onClick={() => removeDay(dayIndex)}
          variant="outline"
          className="text-red-500"
        >
          Remove Day
        </Button>
      </div>

      {slotFields.map((slot, slotIndex) => (
        <SlotFieldSection
          key={slot.id}
          control={control}
          dayIndex={dayIndex}
          slotIndex={slotIndex}
          removeSlot={removeSlot}
        />
      ))}

      <Button
        type="button"
        onClick={() =>
          addSlot({ slotType: "", title: "", description: "", image: "" })
        }
        className="text-blue-600 mt-2"
      >
        + Add Slot
      </Button>
    </div>
  );
};
