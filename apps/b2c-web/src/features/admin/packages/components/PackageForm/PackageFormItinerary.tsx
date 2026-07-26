import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReusableInput } from "@/components/forms/ReusableInput";
import { Clock, Calendar, Plus } from "lucide-react";
import { SectionHeader, StyledField } from "./PackageFormUI";
import { HighlightsSection } from "../HighlightsSection";
import { ItineraryDaySection } from "../ItineraryDaySection";

export function PackageFormItinerary({ formControl, isActivity, dayFields, addDay, removeDay }: { formControl: any, isActivity: boolean, dayFields: any[], addDay: (item: any) => void, removeDay: (index: number) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      {isActivity ? (
        <div className="space-y-6">
          <Card className="p-6 border border-neutral-200/60 shadow-xl shadow-neutral-200/30 rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-md transition-all">
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
              className="bg-neutral-800 text-white hover:bg-neutral-900 rounded-xl font-bold text-[10px] gap-2 py-4 px-6 shadow-lg shadow-neutral-200 transition-all hover:-translate-y-0.5 active:translate-y-0 border border-neutral-700 uppercase tracking-wider"
            >
              <Plus size={14} /> Add Day
            </Button>
          </div>
          <div className="space-y-6">
            {dayFields.map((day, index) => (
              <ItineraryDaySection key={day.id} control={formControl} dayIndex={index} removeDay={removeDay} />
            ))}
            {dayFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-neutral-100 rounded-[24px] bg-neutral-50/50">
                <Calendar size={32} className="mx-auto text-neutral-200 mb-3" />
                <p className="text-neutral-400 font-semibold uppercase tracking-wider text-[9px]">No days added yet</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
