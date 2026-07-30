/**
 * QuoteWizard Component — premium multi-step CRM-style quote request wizard.
 */
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  User,
  Calendar,
  Briefcase,
  Utensils,
  Loader2,
  Save,
} from "lucide-react";
import { useCreateQuote, useSaveDraftQuote } from "../hooks/useQuotes";
import { BudgetCategory, TransferType, MealPlan, CreateQuoteDTO } from "../types/quote.types";
import Stepper from "@/components/ui/Stepper";
import { Button } from "@travelagency/ui";
import { ROUTES } from "@/lib/routes";
import Link from "next/link";
import { cn } from "@travelagency/utils";

const wizardSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .min(2, "Destination must be at least 2 characters")
      .max(100, "Destination cannot exceed 100 characters"),
    travelStart: z
      .string()
      .trim()
      .min(1, "Start date is required")
      .refine(
        (val) => {
          const d = new Date(val);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return d >= today;
        },
        { message: "Travel start date cannot be in the past" }
      ),
    travelEnd: z.string().trim().min(1, "End date is required"),
    adults: z.number().int("Adults count must be an integer").min(1, "At least 1 adult is required"),
    children: z
      .number()
      .int("Children count must be an integer")
      .min(0, "Children count cannot be negative")
      .default(0),
    rooms: z.number().int("Rooms count must be an integer").min(1, "At least 1 room is required"),
    budgetCategory: z.enum([
      BudgetCategory.ECONOMY,
      BudgetCategory.STANDARD,
      BudgetCategory.PREMIUM,
      BudgetCategory.LUXURY,
    ]),
    preferredHotels: z
      .string()
      .trim()
      .max(500, "Preferred hotels cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
    transfers: z
      .enum([TransferType.NONE, TransferType.SHARED, TransferType.PRIVATE, TransferType.LUXURY])
      .default(TransferType.NONE),
    meals: z
      .enum([
        MealPlan.NONE,
        MealPlan.BREAKFAST,
        MealPlan.HALF_BOARD,
        MealPlan.FULL_BOARD,
        MealPlan.ALL_INCLUSIVE,
      ])
      .default(MealPlan.NONE),
    guideRequired: z.boolean().default(false),
    specialRequirements: z
      .string()
      .trim()
      .max(1000, "Special requirements cannot exceed 1000 characters")
      .optional()
      .or(z.literal("")),
    contactPerson: z
      .object({
        name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
        email: z.string().trim().email("Invalid email address"),
        phone: z.string().trim().min(7, "Phone number must be at least 7 digits").max(20),
        designation: z.string().trim().max(80).optional().or(z.literal("")),
      })
      .strict(),
  })
  .strict()
  .refine(
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

const fieldClass = cn(
  "w-full h-12 bg-[var(--ent-elevated,#1c1c22)] border border-white/[0.12]",
  "text-[var(--ent-text-main,#F4F4F5)] placeholder:text-zinc-500",
  "text-sm px-4 rounded-xl outline-none transition-all duration-200",
  "hover:border-[#F8B400]/40 focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22"
);

const labelClass =
  "text-[10px] font-bold uppercase tracking-widest text-zinc-400";

const panelClass =
  "bg-[var(--ent-elevated,#1c1c22)] border border-white/[0.08] p-5 rounded-2xl space-y-3";

const stepMotion = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">{message}</p>
  );
}

export default function QuoteWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [draftId, setDraftId] = useState<string>("new");
  const [submittedQuote, setSubmittedQuote] = useState<unknown | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [direction, setDirection] = useState(1);
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

  const {
    watch,
    trigger,
    getValues,
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleSaveDraft = async () => {
    const values = getValues();
    const currentErrors = methods.formState.errors;

    if (Object.keys(currentErrors).length > 0) return;

    const hasMeaningfulData =
      values.destination?.trim() ||
      values.travelStart ||
      values.contactPerson?.name?.trim();

    if (!hasMeaningfulData) return;

    setSaveStatus("saving");

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
          if (data && data.id) setDraftId(data.id);
          setSaveStatus("saved");
        },
        onError: () => setSaveStatus("error"),
      }
    );
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 1)
      fieldsToValidate = ["contactPerson.name", "contactPerson.email", "contactPerson.phone"];
    if (currentStep === 2)
      fieldsToValidate = [
        "destination",
        "travelStart",
        "travelEnd",
        "adults",
        "children",
        "rooms",
      ];
    if (currentStep === 3) fieldsToValidate = ["budgetCategory", "preferredHotels", "transfers"];
    if (currentStep === 4)
      fieldsToValidate = ["meals", "guideRequired", "specialRequirements"];

    const isValid = await trigger(fieldsToValidate as Parameters<typeof trigger>[0]);
    if (isValid) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      handleSaveDraft();
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId < currentStep) {
      setDirection(stepId > currentStep ? 1 : -1);
      setCurrentStep(stepId);
    }
  };

  const onSubmit = (data: Record<string, unknown>) => {
    startTransition(async () => {
      createMutation.mutate(data as unknown as CreateQuoteDTO, {
        onSuccess: (res) => setSubmittedQuote(res),
      });
    });
  };

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
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-[var(--ent-card,#16161b)] border border-[#F8B400]/25 p-8 md:p-10 rounded-3xl text-center space-y-6 ent-card-shadow"
      >
        <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Quotation Request Submitted</h2>
          <p className="text-zinc-400 text-sm mt-2">
            Your request has been queued in operations under reference:
          </p>
          <div className="mt-4 p-3 bg-[var(--ent-elevated,#1c1c22)] border border-white/[0.1] rounded-xl font-mono text-sm font-bold text-[#F8B400] inline-block">
            {ref}
          </div>
        </div>

        <div className="border-t border-white/[0.08] pt-6 space-y-3 max-w-sm mx-auto text-left text-xs font-semibold text-zinc-400">
          <div className="flex justify-between">
            <span>Estimated response:</span>
            <span className="text-white">24-48 Business Hours</span>
          </div>
          <div className="flex justify-between">
            <span>Contact Person:</span>
            <span className="text-white">{watch("contactPerson.name")}</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center pt-4 flex-wrap">
          <Link href={ROUTES.dashboard}>
            <Button variant="secondary" className="font-bold py-2.5 px-6 rounded-xl">
              Back to Dashboard
            </Button>
          </Link>
          <Button
            onClick={() => window.location.reload()}
            className="font-black py-2.5 px-6 rounded-xl"
          >
            Create another Quote
          </Button>
        </div>
      </motion.div>
    );
  }

  const animatedStep = {
    initial: { opacity: 0, x: direction > 0 ? 28 : -28 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction > 0 ? -20 : 28 },
    transition: stepMotion.transition,
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full space-y-6 ent-animate-in">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-5 border-b border-white/[0.08]">
          <div className="flex items-start gap-3">
            <span className="ent-gold-bar h-11 mt-0.5 shrink-0" aria-hidden />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">New Quote Request</h1>
              <p className="text-xs text-zinc-400 mt-1">
                Submit traveler parameters for customized partner quotes.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-black tracking-widest">
            {saveStatus === "saving" && (
              <>
                <Loader2 size={12} className="animate-spin text-[#F8B400]" />
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

        <div className="bg-[var(--ent-card,#16161b)] border border-white/[0.08] rounded-2xl p-4 md:p-5 ent-card-shadow">
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            validationErrors={{}}
            onStepClick={handleStepClick}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full bg-[var(--ent-card,#16161b)] border border-white/[0.08] rounded-3xl p-6 md:p-8 lg:p-10 space-y-8 ent-card-shadow overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/45 before:to-transparent"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              initial={animatedStep.initial}
              animate={animatedStep.animate}
              exit={animatedStep.exit}
              transition={animatedStep.transition}
              className="min-h-[280px]"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <User size={16} className="text-[#F8B400]" /> Contact Details
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Primary communications contact details for this quote request.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Name <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="text"
                        {...methods.register("contactPerson.name")}
                        placeholder="Enter guest operator/traveler name"
                        className={fieldClass}
                      />
                      <FieldError message={errors.contactPerson?.name?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Email Address <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="email"
                        {...methods.register("contactPerson.email")}
                        placeholder="partner@travelagency.com"
                        className={fieldClass}
                      />
                      <FieldError message={errors.contactPerson?.email?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Phone <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="tel"
                        {...methods.register("contactPerson.phone")}
                        placeholder="+91 99999 99999"
                        className={fieldClass}
                      />
                      <FieldError message={errors.contactPerson?.phone?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Designation</label>
                      <input
                        type="text"
                        {...methods.register("contactPerson.designation")}
                        placeholder="e.g. Travel Agent, Client Operator"
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Calendar size={16} className="text-[#F8B400]" /> Travel Parameters
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Specify destination countries, travel dates, and guest counts.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    <div className="space-y-2 md:col-span-2 lg:col-span-3">
                      <label className={labelClass}>
                        Destination <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="text"
                        {...methods.register("destination")}
                        placeholder="e.g. Paris, France or Bali, Indonesia"
                        className={fieldClass}
                      />
                      <FieldError message={errors.destination?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Travel Start Date <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        {...methods.register("travelStart")}
                        className={cn(fieldClass, "[color-scheme:dark]")}
                      />
                      <FieldError message={errors.travelStart?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Travel End Date <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        {...methods.register("travelEnd")}
                        className={cn(fieldClass, "[color-scheme:dark]")}
                      />
                      <FieldError message={errors.travelEnd?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Adult Guests <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="number"
                        {...methods.register("adults", { valueAsNumber: true })}
                        className={fieldClass}
                      />
                      <FieldError message={errors.adults?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Children Guests</label>
                      <input
                        type="number"
                        {...methods.register("children", { valueAsNumber: true })}
                        className={fieldClass}
                      />
                      <FieldError message={errors.children?.message} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Rooms Required <span className="text-[#F8B400]">*</span>
                      </label>
                      <input
                        type="number"
                        {...methods.register("rooms", { valueAsNumber: true })}
                        className={fieldClass}
                      />
                      <FieldError message={errors.rooms?.message} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Briefcase size={16} className="text-[#F8B400]" /> Accommodation & Transport
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Specify partner packaging, hotel tiers, and logistics.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Budget Class <span className="text-[#F8B400]">*</span>
                      </label>
                      <select
                        {...methods.register("budgetCategory")}
                        className={cn(fieldClass, "[color-scheme:dark]")}
                      >
                        <option value={BudgetCategory.ECONOMY}>Economy</option>
                        <option value={BudgetCategory.STANDARD}>Standard</option>
                        <option value={BudgetCategory.PREMIUM}>Premium</option>
                        <option value={BudgetCategory.LUXURY}>Luxury</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Transfers & Logistics</label>
                      <select
                        {...methods.register("transfers")}
                        className={cn(fieldClass, "[color-scheme:dark]")}
                      >
                        <option value={TransferType.NONE}>No Transfers</option>
                        <option value={TransferType.SHARED}>Shared Shuttle</option>
                        <option value={TransferType.PRIVATE}>Private Vehicle</option>
                        <option value={TransferType.LUXURY}>Luxury Limousine</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className={labelClass}>Preferred Hotels (Optional)</label>
                      <input
                        type="text"
                        {...methods.register("preferredHotels")}
                        placeholder="Enter hotel chain names, separated by commas"
                        className={fieldClass}
                      />
                      <FieldError message={errors.preferredHotels?.message} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <Utensils size={16} className="text-[#F8B400]" /> Meals & Activities
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Specify board preferences, travel guides, and special requirements.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                    <div className="space-y-2">
                      <label className={labelClass}>Board Basis</label>
                      <select
                        {...methods.register("meals")}
                        className={cn(fieldClass, "[color-scheme:dark]")}
                      >
                        <option value={MealPlan.NONE}>Room Only</option>
                        <option value={MealPlan.BREAKFAST}>Bed & Breakfast</option>
                        <option value={MealPlan.HALF_BOARD}>Half Board (2 Meals)</option>
                        <option value={MealPlan.FULL_BOARD}>Full Board (3 Meals)</option>
                        <option value={MealPlan.ALL_INCLUSIVE}>All Inclusive</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <label
                        htmlFor="guideRequired"
                        className={cn(
                          "flex items-center gap-3 w-full h-12 px-3.5 rounded-xl cursor-pointer border transition-all",
                          watch("guideRequired")
                            ? "bg-[#F8B400]/12 border-[#F8B400]/45"
                            : "bg-[var(--ent-elevated,#1c1c22)] border-white/[0.12] hover:border-[#F8B400]/35"
                        )}
                      >
                        <input
                          type="checkbox"
                          id="guideRequired"
                          {...methods.register("guideRequired")}
                          className="size-4 rounded border-white/20 bg-transparent text-[#F8B400] focus:ring-[#F8B400]/30"
                        />
                        <span
                          className={cn(
                            "text-xs font-bold select-none",
                            watch("guideRequired") ? "text-[#F8B400]" : "text-zinc-200"
                          )}
                        >
                          Local Tour Guide Required
                        </span>
                      </label>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className={labelClass}>Special Requirements / Notes (Optional)</label>
                      <textarea
                        rows={4}
                        {...methods.register("specialRequirements")}
                        placeholder="Specify flight connections, dietary restrictions, child seat requests, or milestone events..."
                        className={cn(fieldClass, "h-auto py-3 resize-none")}
                      />
                      <FieldError message={errors.specialRequirements?.message} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="border-b border-white/[0.08] pb-4">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#F8B400]" /> Review Quote Parameters
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Review all travel information before final pipeline submission.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                    <div className={panelClass}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#F8B400]">
                        Contact Details
                      </h4>
                      <div className="text-xs space-y-1.5 font-semibold text-zinc-400">
                        <p className="flex justify-between gap-3">
                          <span>Name:</span>{" "}
                          <span className="text-white text-right">{watch("contactPerson.name")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Email:</span>{" "}
                          <span className="text-white text-right break-all">
                            {watch("contactPerson.email")}
                          </span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Phone:</span>{" "}
                          <span className="text-white text-right">{watch("contactPerson.phone")}</span>
                        </p>
                        {watch("contactPerson.designation") && (
                          <p className="flex justify-between gap-3">
                            <span>Designation:</span>{" "}
                            <span className="text-white text-right">
                              {watch("contactPerson.designation")}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={panelClass}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#F8B400]">
                        Travel parameters
                      </h4>
                      <div className="text-xs space-y-1.5 font-semibold text-zinc-400">
                        <p className="flex justify-between gap-3">
                          <span>Destination:</span>{" "}
                          <span className="text-white text-right">{watch("destination")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Start Date:</span>{" "}
                          <span className="text-white">{watch("travelStart")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>End Date:</span>{" "}
                          <span className="text-white">{watch("travelEnd")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Adults:</span> <span className="text-white">{watch("adults")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Children:</span>{" "}
                          <span className="text-white">{watch("children")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Rooms:</span> <span className="text-white">{watch("rooms")}</span>
                        </p>
                      </div>
                    </div>

                    <div className={cn(panelClass, "md:col-span-2")}>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#F8B400]">
                        Logistics & Preferences
                      </h4>
                      <div className="text-xs space-y-1.5 font-semibold text-zinc-400">
                        <p className="flex justify-between gap-3">
                          <span>Budget Tier:</span>{" "}
                          <span className="text-white uppercase">{watch("budgetCategory")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Logistics:</span>{" "}
                          <span className="text-white uppercase">{watch("transfers")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Board Plan:</span>{" "}
                          <span className="text-white uppercase">{watch("meals")}</span>
                        </p>
                        <p className="flex justify-between gap-3">
                          <span>Tour Guide:</span>{" "}
                          <span className="text-white">
                            {watch("guideRequired") ? "Yes" : "No"}
                          </span>
                        </p>
                        {watch("preferredHotels") && (
                          <p className="flex justify-between gap-3">
                            <span>Preferred Hotels:</span>{" "}
                            <span className="text-white text-right">{watch("preferredHotels")}</span>
                          </p>
                        )}
                        {watch("specialRequirements") && (
                          <div className="pt-2 border-t border-white/[0.08]">
                            <p className="text-zinc-500 mb-1">Special Requirements:</p>
                            <p className="text-white whitespace-pre-wrap">
                              {watch("specialRequirements")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between border-t border-white/[0.08] pt-6 gap-3">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={prevStep}
                disabled={createMutation.isPending}
                className="font-bold"
              >
                <ArrowLeft size={16} /> Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button type="button" onClick={nextStep} className="font-bold min-w-[140px]">
                Continue <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="font-bold min-w-[160px] flex items-center gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting…
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
