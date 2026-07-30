import { Card } from "@travelagency/ui";
import { Button } from "@travelagency/ui";
import { ReusableInput } from "@travelagency/forms";
import { Clock, Calendar, Plus } from "lucide-react";
import { SectionHeader, StyledField } from "./PackageFormUI";
import { HighlightsSection } from "../HighlightsSection";
import { ItineraryDaySection } from "../ItineraryDaySection";

export function PackageFormItinerary({ formControl, isActivity, dayFields, addDay, removeDay }: { formControl: any, isActivity: boolean, dayFields: any[], addDay: (item: any) => void, removeDay: (index: number) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      {isActivity ? (
        <div className="space-y-6">
          <Card className="p-6 border border-white/[0.08] shadow-[0_8px_28px_rgba(0,0,0,0.35)] rounded-[20px] overflow-hidden bg-[var(--ent-card,#18181c)] transition-all" hoverable={false}>
            <SectionHeader icon={Clock} title="Logistics" subtitle="Working hours & languages" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <StyledField>
                <ReusableInput control={formControl} name="operatingHours" label="Operating Hours" placeholder="e.g. 08:00 AM To 02:00 PM" variant="floating" />
              </StyledField>
              <StyledField>
                <ReusableInput control={formControl} name="languages" label="Languages" placeholder="e.g. English, Arabic" variant="floating" />
              </StyledField>
            </div>
          </Card>
          <HighlightsSection control={formControl} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4">
            <SectionHeader icon={Calendar} title="Journey Roadmap" subtitle="Day-by-day experience plan" />
            <Button
              type="button"
              onClick={() => addDay({ dayTitle: "", slots: [{ slotType: "", title: "", description: "", imageUrl: "", imageAlt: "" }] })}
              className="bg-[var(--ent-elevated,#1c1c22)] text-zinc-100 hover:bg-white/[0.08] rounded-xl font-bold text-[10px] gap-2 py-4 px-6 border border-white/[0.1] uppercase tracking-wider"
            >
              <Plus size={14} /> Add Day
            </Button>
          </div>
          <div className="space-y-6">
            {dayFields.map((day, index) => (
              <ItineraryDaySection key={day.id} control={formControl} dayIndex={index} removeDay={removeDay} />
            ))}
            {dayFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-white/[0.1] rounded-[20px] bg-white/[0.02]">
                <Calendar size={32} className="mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-500 font-semibold uppercase tracking-wider text-[9px]">No days added yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
