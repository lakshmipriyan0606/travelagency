import { useFieldArray, Control } from "react-hook-form";
import { Plus, X, List } from "lucide-react";
import { Button } from "@travelagency/ui";
import { ReusableInput } from "@travelagency/forms";
import { Card } from "@travelagency/ui";

interface HighlightsSectionProps {
  control: Control<any>;
}

export const HighlightsSection = ({ control }: HighlightsSectionProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "highlights",
  });

  return (
    <Card className="p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/10">
            <List size={18} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-neutral-800 tracking-tight leading-none">Activity Highlights</h3>
            <p className="text-[9px] text-neutral-400 mt-1 font-medium italic">Key features of this activity</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => append("")}
          size="sm"
          className="bg-neutral-800 text-white hover:bg-neutral-900 rounded-xl font-bold text-[10px] gap-2 py-4 px-4 shadow-lg uppercase tracking-wider h-8"
        >
          <Plus size={14} /> Add Highlight
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1">
              <ReusableInput
                control={control}
                name={`highlights.${index}.item`}
                placeholder={`Highlight #${index + 1}`}
                variant="floating"
                appearance="light"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-3 w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-100 transition-colors border border-rose-100"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-center text-[10px] text-neutral-400 font-medium italic py-4">No highlights added yet. Click "Add Highlight" to begin.</p>
        )}
      </div>
    </Card>
  );
};

