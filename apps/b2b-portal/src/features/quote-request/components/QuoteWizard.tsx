/**
 * QuoteWizard Component — premium multi-step CRM-style quote request wizard.
 */
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  ArrowRight, ArrowLeft, Send, CheckCircle, 
  AlertCircle, ShieldCheck, User, Calendar, 
  Briefcase, Utensils, Loader2, Save
} from "lucide-react";
import { useCreateQuote, useSaveDraftQuote } from "../hooks/useQuotes";
import { BudgetCategory, TransferType, MealPlan, CreateQuoteDTO } from "../types/quote.types";
import Stepper from "@/components/ui/Stepper";
import { Button } from "@travelagency/ui";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";

// Frontend validation schema matching backend specifications exactly
const wizardSchema = z.object({
  destination: z.string().trim().min(2, "Destination must be at least 2 characters").max(100, "Destination cannot exceed 100 characters"),
  travelStart: z.string().trim().min(1, "Start date is required").refine((val) => {
    const d = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  }, { message: "Travel start date cannot be in the past" }),
  travelEnd: z.string().trim().min(1, "End date is required"),
  adults: z.number().int("Adults count must be an integer").min(1, "At least 1 adult is required"),
  children: z.number().int("Children count must be an integer").min(0, "Children count cannot be negative").default(0),
  rooms: z.number().int("Rooms count must be an integer").min(1, "At least 1 room is required"),
  budgetCategory: z.enum([BudgetCategory.ECONOMY, BudgetCategory.STANDARD, BudgetCategory.PREMIUM, BudgetCategory.LUXURY]),
  preferredHotels: z.string().trim().max(500, "Preferred hotels cannot exceed 500 characters").optional().or(z.literal("")),
  transfers: z.enum([TransferType.NONE, TransferType.SHARED, TransferType.PRIVATE, TransferType.LUXURY]).default(TransferType.NONE),
  meals: z.enum([MealPlan.NONE, MealPlan.BREAKFAST, MealPlan.HALF_BOARD, MealPlan.FULL_BOARD, MealPlan.ALL_INCLUSIVE]).default(MealPlan.NONE),
  guideRequired: z.boolean().default(false),
  specialRequirements: z.string().trim().max(1000, "Special requirements cannot exceed 1000 characters").optional().or(z.literal("")),
  contactPerson: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().trim().email("Invalid email address"),
    phone: z.string().trim().min(7, "Phone number must be at least 7 digits").max(20),
    designation: z.string().trim().max(80).optional().or(z.literal("")),
  }).strict(),
}).strict().refine(
  (data) => {
    const start = new Date(data.travelStart);
    const end = new Date(data.travelEnd);
    return end >= start;
  },
  {
    message: "Travel end date must be on or after travel start date",
    path: ["travelEnd"],
  }
);

const STEPS = [
  { id: 1, name: "Traveller Info" },
  { id: 2, name: "Travel Info" },
  { id: 3, name: "Accommodation" },
  { id: 4, name: "Meals & Addons" },
  { id: 5, name: "Review & Submit" },
] as const;

export default function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draftId, setDraftId] = useState<string>("new");
  const [submittedQuote, setSubmittedQuote] = useState<unknown | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  const createMutation = useCreateQuote();
  const saveDraftMutation = useSaveDraftQuote();

  const methods = useForm({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      destination: "",
      travelStart: "",
      travelEnd: "",
      adults: 1,
      children: 0,
      rooms: 1,
      budgetCategory: BudgetCategory.STANDARD,
      preferredHotels: "",
      transfers: TransferType.NONE,
      meals: MealPlan.NONE,
      guideRequired: false,
      specialRequirements: "",
      contactPerson: {
        name: "",
        email: "",
        phone: "",
        designation: "",
      },
    },
    mode: "onBlur",
  });

  const { watch, trigger, getValues, handleSubmit, formState: { errors } } = methods;

  // Auto-save draft trigger on step transitions or input changes
  const handleSaveDraft = async () => {
    const values = getValues();
    const currentErrors = methods.formState.errors;

    // If there are any active validation errors, skip autosave silently
    // (prevents "AUTOSAVE FAILED" banner when user has invalid data like a past date)
    if (Object.keys(currentErrors).length > 0) {
      return;
    }

    // Only save if we have at least some meaningful data
    const hasMeaningfulData =
      values.destination?.trim() ||
      values.travelStart ||
      values.contactPerson?.name?.trim();

    if (!hasMeaningfulData) return;

    setSaveStatus("saving");

    // Build partial DTO for saving draft
    const dto = {
      destination: values.destination || undefined,
      travelStart: values.travelStart || undefined,
      travelEnd: values.travelEnd || undefined,
      adults: values.adults,
      children: values.children,
      rooms: values.rooms,
      budgetCategory: values.budgetCategory,
      preferredHotels: values.preferredHotels || undefined,
      transfers: values.transfers,
      meals: values.meals,
      guideRequired: values.guideRequired,
      specialRequirements: values.specialRequirements || undefined,
      contactPerson: values.contactPerson,
    };

    saveDraftMutation.mutate(
      { id: draftId, dto },
      {
        onSuccess: (data) => {
          if (data && data.id) {
            setDraftId(data.id);
          }
          setSaveStatus("saved");
        },
        onError: () => {
          setSaveStatus("error");
        },
      }
    );
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 1) fieldsToValidate = ["contactPerson.name", "contactPerson.email", "contactPerson.phone"];
    if (currentStep === 2) fieldsToValidate = ["destination", "travelStart", "travelEnd", "adults", "children", "rooms"];
    if (currentStep === 3) fieldsToValidate = ["budgetCategory", "preferredHotels", "transfers"];
    if (currentStep === 4) fieldsToValidate = ["meals", "guideRequired", "specialRequirements"];

    const isValid = await trigger(fieldsToValidate as Parameters<typeof trigger>[0]);
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep((prev) => prev + 1);
      handleSaveDraft();
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      createMutation.mutate(data as unknown as CreateQuoteDTO, {
        onSuccess: (res) => {
          setSubmittedQuote(res);
        },
      });
    });
  };

  // Prevent closing page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (submittedQuote) {
    const ref = (submittedQuote as { reference?: string })?.reference || "Pending Reference";
    return (
      <div className="max-w-2xl mx-auto bg-surface border border-border p-8 rounded-3xl text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Quotation Request Submitted</h2>
          <p className="text-text-secondary text-sm mt-2">
            Your request has been queued in operations under reference:
          </p>
          <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800 rounded-xl font-mono text-sm font-bold text-white inline-block">
            {ref}
          </div>
        </div>

        <div className="border-t border-border pt-6 space-y-3 max-w-sm mx-auto text-left text-xs font-semibold text-text-secondary">
          <div className="flex justify-between">
            <span>Estimated response:</span>
            <span className="text-white">24-48 Business Hours</span>
          </div>
          <div className="flex justify-between">
            <span>Contact Person:</span>
            <span className="text-white">{watch("contactPerson.name")}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-4">
          <Link href={ROUTES.dashboard}>
            <Button className="bg-neutral-900 border border-neutral-800 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-neutral-800 transition">
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={() => window.location.reload()} className="bg-primary-accent hover:bg-amber-400 text-neutral-950 font-black py-2.5 px-6 rounded-xl transition">
            Create another Quote
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-8">
        {/* Header with save status indication */}
        <div className="flex justify-between items-center pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">New Quote Request</h1>
            <p className="text-xs text-text-secondary mt-1">Submit traveler parameters for customized partner quotes.</p>
          </div>
          <div className="flex items-center gap-2 text-text-muted text-[10px] uppercase font-black tracking-widest">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={12} className="animate-spin text-primary-accent" />
                <span>Auto-saving draft...</span>
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Save size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Draft saved</span>
              </>
            )}
            {saveStatus === "error" && (
              <>
                <AlertCircle size={12} className="text-red-400" />
                <span className="text-red-400">Autosave failed</span>
              </>
            )}
          </div>
        </div>

        {/* Stepper Widget */}
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          validationErrors={{}}
          onStepClick={handleStepClick}
        />

        {/* Wizard Form Panels */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-3xl p-6 md:p-8 space-y-8 shadow-premium">
          
          {/* Step 1: Traveller Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <User size={16} className="text-primary-accent" /> Contact Details
                </h3>
                <p className="text-xs text-text-secondary mt-1">Primary communications contact details for this quote request.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Name <span className="text-primary-accent">*</span></label>
                  <input
                    type="text"
                    {...methods.register("contactPerson.name")}
                    placeholder="Enter guest operator/traveler name"
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.contactPerson?.name && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.contactPerson.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Email Address <span className="text-primary-accent">*</span></label>
                  <input
                    type="email"
                    {...methods.register("contactPerson.email")}
                    placeholder="partner@travelagency.com"
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.contactPerson?.email && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.contactPerson.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Phone <span className="text-primary-accent">*</span></label>
                  <input
                    type="tel"
                    {...methods.register("contactPerson.phone")}
                    placeholder="+91 99999 99999"
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.contactPerson?.phone && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.contactPerson.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Designation</label>
                  <input
                    type="text"
                    {...methods.register("contactPerson.designation")}
                    placeholder="e.g. Travel Agent, Client Operator"
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Travel Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Calendar size={16} className="text-primary-accent" /> Travel Parameters
                </h3>
                <p className="text-xs text-text-secondary mt-1">Specify destination countries, travel dates, and guests counts.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Destination <span className="text-primary-accent">*</span></label>
                  <input
                    type="text"
                    {...methods.register("destination")}
                    placeholder="e.g. Paris, France or Bali, Indonesia"
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.destination && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.destination.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Travel Start Date <span className="text-primary-accent">*</span></label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...methods.register("travelStart")}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition text-white"
                  />
                  {errors.travelStart && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.travelStart.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Travel End Date <span className="text-primary-accent">*</span></label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...methods.register("travelEnd")}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition text-white"
                  />
                  {errors.travelEnd && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.travelEnd.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Adult Guests <span className="text-primary-accent">*</span></label>
                  <input
                    type="number"
                    {...methods.register("adults", { valueAsNumber: true })}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.adults && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.adults.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Children Guests</label>
                  <input
                    type="number"
                    {...methods.register("children", { valueAsNumber: true })}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.children && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.children.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Rooms Required <span className="text-primary-accent">*</span></label>
                  <input
                    type="number"
                    {...methods.register("rooms", { valueAsNumber: true })}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.rooms && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.rooms.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Accommodation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Briefcase size={16} className="text-primary-accent" /> Accommodation & Transport
                </h3>
                <p className="text-xs text-text-secondary mt-1">Specify partner packaging, hotel tiers, and logistics.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Budget Class <span className="text-primary-accent">*</span></label>
                  <select
                    {...methods.register("budgetCategory")}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition text-white"
                  >
                    <option value={BudgetCategory.ECONOMY}>Economy</option>
                    <option value={BudgetCategory.STANDARD}>Standard</option>
                    <option value={BudgetCategory.PREMIUM}>Premium</option>
                    <option value={BudgetCategory.LUXURY}>Luxury</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Transfers & Logistics</label>
                  <select
                    {...methods.register("transfers")}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition text-white"
                  >
                    <option value={TransferType.NONE}>No Transfers</option>
                    <option value={TransferType.SHARED}>Shared Shuttle</option>
                    <option value={TransferType.PRIVATE}>Private Vehicle</option>
                    <option value={TransferType.LUXURY}>Luxury Limousine</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Preferred Hotels (Optional)</label>
                  <input
                    type="text"
                    {...methods.register("preferredHotels")}
                    placeholder="Enter hotel chain names, separated by commas"
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition"
                  />
                  {errors.preferredHotels && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.preferredHotels.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Meals */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <Utensils size={16} className="text-primary-accent" /> Meals & Activities
                </h3>
                <p className="text-xs text-text-secondary mt-1">Specify board preferences, travel guides, and special requirements.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Board Basis</label>
                  <select
                    {...methods.register("meals")}
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition text-white"
                  >
                    <option value={MealPlan.NONE}>Room Only</option>
                    <option value={MealPlan.BREAKFAST}>Bed & Breakfast</option>
                    <option value={MealPlan.HALF_BOARD}>Half Board (2 Meals)</option>
                    <option value={MealPlan.FULL_BOARD}>Full Board (3 Meals)</option>
                    <option value={MealPlan.ALL_INCLUSIVE}>All Inclusive</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="guideRequired"
                    {...methods.register("guideRequired")}
                    className="w-4 h-4 bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 rounded outline-none focus:ring-0 text-primary-accent"
                  />
                  <label htmlFor="guideRequired" className="text-xs font-bold text-white cursor-pointer select-none">Local Tour Guide Required</label>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Special Requirements / Notes (Optional)</label>
                  <textarea
                    rows={4}
                    {...methods.register("specialRequirements")}
                    placeholder="Specify flight connections, dietary restrictions, child seat requests, or milestone events..."
                    className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none focus:border-neutral-700 transition resize-none"
                  />
                  {errors.specialRequirements && <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{errors.specialRequirements.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-text-primary flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary-accent" /> Review Quote Parameters
                </h3>
                <p className="text-xs text-text-secondary mt-1">Review all travel information before final pipeline submission.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel 1 */}
                <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary-accent">Contact Details</h4>
                  <div className="text-xs space-y-1 font-semibold text-text-secondary">
                    <p className="flex justify-between"><span>Name:</span> <span className="text-white">{watch("contactPerson.name")}</span></p>
                    <p className="flex justify-between"><span>Email:</span> <span className="text-white">{watch("contactPerson.email")}</span></p>
                    <p className="flex justify-between"><span>Phone:</span> <span className="text-white">{watch("contactPerson.phone")}</span></p>
                    {watch("contactPerson.designation") && (
                      <p className="flex justify-between"><span>Designation:</span> <span className="text-white">{watch("contactPerson.designation")}</span></p>
                    )}
                  </div>
                </div>
                 {/* Panel 2 */}
                <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary-accent">Travel parameters</h4>
                  <div className="text-xs space-y-1 font-semibold text-text-secondary">
                    <p className="flex justify-between"><span>Destination:</span> <span className="text-white">{watch("destination")}</span></p>
                    <p className="flex justify-between"><span>Start Date:</span> <span className="text-white">{watch("travelStart")}</span></p>
                    <p className="flex justify-between"><span>End Date:</span> <span className="text-white">{watch("travelEnd")}</span></p>
                    <p className="flex justify-between"><span>Adults:</span> <span className="text-white">{watch("adults")}</span></p>
                    <p className="flex justify-between"><span>Children:</span> <span className="text-white">{watch("children")}</span></p>
                    <p className="flex justify-between"><span>Rooms:</span> <span className="text-white">{watch("rooms")}</span></p>
                  </div>
                </div>

                {/* Panel 3 */}
                <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-2xl space-y-3 md:col-span-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-primary-accent">Logistics & Preferences</h4>
                  <div className="text-xs space-y-1 font-semibold text-text-secondary">
                    <p className="flex justify-between"><span>Budget Tiers:</span> <span className="text-white uppercase">{watch("budgetCategory")}</span></p>
                    <p className="flex justify-between"><span>Logistics:</span> <span className="text-white uppercase">{watch("transfers")}</span></p>
                    <p className="flex justify-between"><span>Board Plan:</span> <span className="text-white uppercase">{watch("meals")}</span></p>
                    <p className="flex justify-between"><span>Tour Guide:</span> <span className="text-white">{watch("guideRequired") ? "Yes" : "No"}</span></p>
                    {watch("preferredHotels") && (
                      <p className="flex justify-between"><span>Preferred Hotels:</span> <span className="text-white">{watch("preferredHotels")}</span></p>
                    )}
                    {watch("specialRequirements") && (
                      <div className="pt-2 border-t border-neutral-200">
                        <p className="text-text-muted mb-1">Special Requirements:</p>
                        <p className="text-white whitespace-pre-wrap">{watch("specialRequirements")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Actions Footer */}
          <div className="flex justify-between border-t border-border pt-6">
            {currentStep > 1 ? (
              <Button
                type="button"
                onClick={prevStep}
                disabled={createMutation.isPending}
                className="bg-neutral-100 border border-neutral-200 text-text-primary font-bold py-2.5 px-5 rounded-xl hover:bg-neutral-200 transition disabled:opacity-50"
              >
                <ArrowLeft size={16} className="mr-2 inline" /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-primary-accent hover:bg-amber-400 text-neutral-950 font-bold py-2.5 px-6 rounded-xl transition"
              >
                Continue <ArrowRight size={16} className="ml-2 inline" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary-accent hover:bg-amber-400 text-neutral-950 font-bold py-2.5 px-6 rounded-xl transition shadow-md shadow-primary-accent/15 flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Quote...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
