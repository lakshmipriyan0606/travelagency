"use client";
// @ts-nocheck
import { Package, Calendar, Image as ImageIcon, Tag, List, Clock } from "lucide-react";
import { useFieldArray, FormProvider } from "react-hook-form";
import { createContext, useContext } from "react";
export const AdminPanelContext = createContext<any>(null);

import { usePackageForm } from "./PackageForm/usePackageForm";
import { PackageFormBasicInfo } from "./PackageForm/PackageFormBasicInfo";
import { PackageFormPricing } from "./PackageForm/PackageFormPricing";
import { PackageFormImages } from "./PackageForm/PackageFormImages";
import { PackageFormItinerary } from "./PackageForm/PackageFormItinerary";
import { PackageFormControls } from "./PackageForm/PackageFormControls";

export default function AdminUploadPackageForm({ isActivity: isActivityProp = false }: { isActivity?: boolean }) {
  const context = useContext(AdminPanelContext);
  if (!context) throw new Error("AdminUploadPackageForm must be used within AdminPanelContext");
  const { editId: id, setActive, triggerRefresh } = context;

  const { methods, mainImageFiles, setMainImageFiles, mainImageUrls, setMainImageUrls, activeStep, setActiveStep, onSubmit, isSubmitting, isActivity } = usePackageForm(id, setActive, triggerRefresh, isActivityProp);
  const { control, handleSubmit, watch, formState } = methods;
  const formControl = control as any;
  const { fields: dayFields, append: addDay, remove: removeDay } = useFieldArray({ control, name: "days" });

  const actualSteps = [
    { title: "Core Details", icon: isActivity ? List : Package },
    { title: "Pricing & Visibility", icon: Tag },
    { title: "Media Gallery", icon: ImageIcon },
    { title: isActivity ? "Activity Highlights" : "Journey Roadmap", icon: isActivity ? Clock : Calendar },
  ];
  const filteredSteps = actualSteps.filter((step) => !(isActivity && step.title === "Pricing & Visibility"));

  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    const fieldsByTitle: Record<string, string[]> = {
      "Core Details": ["packageName", "packageDescription", "location", "country", "daysAndNights", "activityCategory", "packageType"],
      "Pricing & Visibility": ["price", "offerPrice", "hotelName", "status", "isActive", "isBestPackage", "bestRank"],
      "Media Gallery": [], "Activity Highlights": ["operatingHours", "languages"], "Journey Roadmap": ["days"]
    };
    const currentTitle = filteredSteps[activeStep].title;
    const fieldsToValidate = fieldsByTitle[currentTitle] || [];
    const isStepValid = await methods.trigger(fieldsToValidate as any);

    if (isStepValid) {
      if (currentTitle === "Core Details") {
        if (!isActivity && (!watch("packageType") || watch("packageType") === "")) return methods.setError("packageType", { type: "required", message: "Category is required for packages" });
        if (isActivity && (!watch("activityCategory") || watch("activityCategory") === "" || watch("activityCategory") === "none")) return methods.setError("activityCategory", { type: "required", message: "Activity Category is required" });
      }
      if (!isActivity && currentTitle === "Pricing & Visibility" && (!watch("price") || watch("price")?.trim() === "")) return methods.setError("price", { type: "required", message: "Price is required for packages" });
      if (!isActivity && currentTitle === "Journey Roadmap") {
        const days = watch("days");
        if (!days || days.length === 0 || !days[0].dayTitle) return methods.setError("days.0.dayTitle", { type: "required", message: "At least one day with a title is required" });
      }
      setActiveStep(prev => Math.min(prev + 1, filteredSteps.length - 1));
    }
  };
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

  return (
    <FormProvider {...methods}>
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-2xl font-black text-neutral-800 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              {isActivity ? "Create Activity" : (id ? "Sync Changes" : "Create Adventure")}
            </h1>
          </div>
        </div>

        <div className="px-4">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto mb-6">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-neutral-100 -translate-y-1/2 z-0" />
            <div className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${(activeStep / (filteredSteps.length - 1)) * 100}%` }} />
            {filteredSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <button type="button" onClick={() => idx < activeStep && setActiveStep(idx)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4 ${activeStep === idx ? "bg-primary text-white border-white scale-110" : activeStep > idx ? "bg-neutral-800 text-white border-white" : "bg-white text-neutral-300 border-neutral-50"}`}>
                    <Icon size={20} />
                  </button>
                  <p className={`absolute -bottom-8 text-[9px] font-bold uppercase tracking-wider ${activeStep === idx ? "text-primary scale-105" : "text-neutral-400 opacity-60"}`}>{step.title}</p>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit(values, activeStep === filteredSteps.length - 1))} className="space-y-6">
          <div className="px-4">
            {filteredSteps[activeStep].title === "Core Details" && <PackageFormBasicInfo formControl={formControl} isActivity={!!isActivity} watch={watch} />}
            {filteredSteps[activeStep].title === "Pricing & Visibility" && <PackageFormPricing formControl={formControl} isActivity={!!isActivity} watch={watch} />}
            {filteredSteps[activeStep].title === "Media Gallery" && <PackageFormImages mainImageFiles={mainImageFiles} setMainImageFiles={setMainImageFiles} mainImageUrls={mainImageUrls} setMainImageUrls={setMainImageUrls} />}
            {(filteredSteps[activeStep].title === "Activity Highlights" || filteredSteps[activeStep].title === "Journey Roadmap") && <PackageFormItinerary formControl={formControl} isActivity={!!isActivity} dayFields={dayFields} addDay={addDay} removeDay={removeDay} />}
          </div>
          <PackageFormControls activeStep={activeStep} totalSteps={filteredSteps.length} nextStep={nextStep} prevStep={prevStep} isSubmitting={isSubmitting} isDirty={formState.isDirty} id={id} />
        </form>
      </div>
    </FormProvider>
  );
}
