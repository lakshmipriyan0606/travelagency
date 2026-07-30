"use client";
// @ts-nocheck
import { Package, Calendar, Image as ImageIcon, Tag, List, Clock } from "lucide-react";
import { useFieldArray, FormProvider } from "react-hook-form";
import { createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export const AdminPanelContext = createContext<any>(null);

import { usePackageForm } from "./PackageForm/usePackageForm";
import { PackageFormBasicInfo } from "./PackageForm/PackageFormBasicInfo";
import { PackageFormPricing } from "./PackageForm/PackageFormPricing";
import { PackageFormImages } from "./PackageForm/PackageFormImages";
import { PackageFormItinerary } from "./PackageForm/PackageFormItinerary";
import { PackageFormControls } from "./PackageForm/PackageFormControls";

import { ROUTES } from "@/lib/routes";

export default function AdminUploadPackageForm({ 
  isActivity: isActivityProp = false,
  editId = null
}: { 
  isActivity?: boolean;
  editId?: string | null;
}) {
  const router = useRouter();
  const handleSuccessRedirect = () => {
    router.push(isActivityProp ? ROUTES.activities.list : ROUTES.packages.list);
    router.refresh();
  };
  const { methods, mainImageFiles, setMainImageFiles, mainImageUrls, setMainImageUrls, activeStep, setActiveStep, onSubmit, isSubmitting, isActivity } = usePackageForm(editId, handleSuccessRedirect, () => {}, isActivityProp);
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
      <div className="max-w-5xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-[#F8B400] rounded-full" />
              {isActivity
                ? (editId ? "Edit Activity" : "Create Activity")
                : (editId ? "Edit Package" : "Create Package")}
            </h1>
          </div>
        </div>

        <div className="px-4">
          <div className="relative flex justify-between items-center max-w-3xl mx-auto mb-10">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/[0.08] -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#F8B400] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(activeStep / (filteredSteps.length - 1)) * 100}%` }}
            />
            {filteredSteps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isDone = activeStep > idx;
              return (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => idx < activeStep && setActiveStep(idx)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border ${
                      isActive
                        ? "bg-gradient-to-br from-[#FFD54A] to-[#F8B400] text-[#0c0c0f] border-[#F8B400] scale-105 shadow-[0_4px_20px_rgba(248,180,0,0.4)]"
                        : isDone
                          ? "bg-[#1c1c22] text-[#F8B400] border-[#F8B400]/45 shadow-[0_0_12px_rgba(248,180,0,0.12)]"
                          : "bg-[#101014] text-zinc-500 border-white/[0.1]"
                    }`}
                  >
                    <Icon size={20} />
                  </button>
                  <p className={`absolute -bottom-8 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    isActive ? "text-[#F8B400]" : "text-zinc-500"
                  }`}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(
          (values) => onSubmit(values, activeStep === filteredSteps.length - 1),
          (errors) => {
            console.error("Form Validation Errors:", errors);
            toast.error("Please fix validation errors before submitting.");
          }
        )} className="space-y-6">
          <div className="px-4">
            {filteredSteps[activeStep].title === "Core Details" && <PackageFormBasicInfo formControl={formControl} isActivity={!!isActivity} watch={watch} />}
            {filteredSteps[activeStep].title === "Pricing & Visibility" && <PackageFormPricing formControl={formControl} isActivity={!!isActivity} watch={watch} />}
            {filteredSteps[activeStep].title === "Media Gallery" && <PackageFormImages mainImageFiles={mainImageFiles} setMainImageFiles={setMainImageFiles} mainImageUrls={mainImageUrls} setMainImageUrls={setMainImageUrls} />}
            {(filteredSteps[activeStep].title === "Activity Highlights" || filteredSteps[activeStep].title === "Journey Roadmap") && <PackageFormItinerary formControl={formControl} isActivity={!!isActivity} dayFields={dayFields} addDay={addDay} removeDay={removeDay} />}
          </div>
          <PackageFormControls activeStep={activeStep} totalSteps={filteredSteps.length} nextStep={nextStep} prevStep={prevStep} isSubmitting={isSubmitting} isDirty={formState.isDirty} id={editId as string} />
        </form>
      </div>
    </FormProvider>
  );
}
