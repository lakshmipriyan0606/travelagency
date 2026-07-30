"use client";
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
    <Card className="p-6 border border-white/[0.08] shadow-[0_8px_28px_rgba(0,0,0,0.35)] rounded-[20px] overflow-hidden bg-[var(--ent-card,#18181c)] transition-all" hoverable={false}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F8B400]/15 flex items-center justify-center text-[#F8B400] border border-[#F8B400]/30">
            <List size={18} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-white tracking-tight leading-none">Activity Highlights</h3>
            <p className="text-[9px] text-zinc-400 mt-1 font-medium">Key features of this activity</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => append("")}
          size="sm"
          className="bg-[var(--ent-elevated,#1c1c22)] text-zinc-100 hover:bg-white/[0.08] rounded-xl font-bold text-[10px] gap-2 py-4 px-4 border border-white/[0.1] uppercase tracking-wider h-8"
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
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-3 w-8 h-8 bg-rose-500/15 text-rose-400 rounded-lg flex items-center justify-center hover:bg-rose-500/25 transition-colors border border-rose-500/20"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-center text-[10px] text-zinc-500 font-medium py-4">No highlights added yet. Click &quot;Add Highlight&quot; to begin.</p>
        )}
      </div>
    </Card>
  );
};
