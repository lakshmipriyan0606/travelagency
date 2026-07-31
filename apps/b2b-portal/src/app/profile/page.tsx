"use client";

import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgentProfile, updateAgentProfile } from "@/api/auth.api";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Save,
  Landmark,
  User,
  Building2,
  Compass,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Stepper from "@/components/ui/Stepper";
import { cn } from "@travelagency/utils";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

const profileSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters"),
    phone: z
      .string()
      .trim()
      .min(8, "Enter a valid phone number (at least 8 characters)")
      .regex(/^[\d\s+\-().]+$/, "Phone may only contain digits and + - ( ) ."),
    designation: z.string().optional(),
    companyName: z.string().trim().min(2, "Company name is required"),
    tradeName: z.string().optional(),
    businessType: z.enum(["travel_agency", "tour_operator", "dmc", "freelance_agent"], {
      message: "Business type is required",
    }),
    registrationNumber: z.string().trim().min(2, "Registration number is required"),
    websiteUrl: z.string().optional(),
    yearsInBusiness: z.number().int().nonnegative().optional().or(z.nan()),
    iataNumber: z.string().optional(),
    gstNumber: z.string().optional(),
    officeAddress: z.object({
      line1: z.string().trim().min(2, "Address line 1 is required"),
      line2: z.string().optional(),
      city: z.string().trim().min(2, "City is required"),
      state: z.string().trim().min(2, "State / province is required"),
      postalCode: z.string().trim().min(2, "Postal code is required"),
      country: z.string().trim().min(2, "Country is required"),
    }),
  })
  .refine(
    (data) => {
      if (
        data.officeAddress.country?.toLowerCase() === "india" &&
        data.gstNumber &&
        data.gstNumber.trim() !== "" &&
        data.gstNumber.trim().length < 15
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Enter a valid 15-character GSTIN for India",
      path: ["gstNumber"],
    }
  );

type ProfileFormValues = z.infer<typeof profileSchema>;

const STEPS = [
  { id: 1, name: "Contact" },
  { id: 2, name: "Agency" },
  { id: 3, name: "Address" },
  { id: 4, name: "Review" },
] as const;

const BUSINESS_TYPE_LABELS: Record<ProfileFormValues["businessType"], string> = {
  travel_agency: "Travel Agency",
  tour_operator: "Tour Operator",
  dmc: "Destination Management Company (DMC)",
  freelance_agent: "Freelance Agent",
};

const STEP_FIELDS: Record<number, (keyof ProfileFormValues | `officeAddress.${keyof ProfileFormValues["officeAddress"]}`)[]> = {
  1: ["name", "phone", "designation"],
  2: [
    "companyName",
    "tradeName",
    "businessType",
    "registrationNumber",
    "websiteUrl",
    "yearsInBusiness",
    "iataNumber",
    "gstNumber",
  ],
  3: [
    "officeAddress.line1",
    "officeAddress.line2",
    "officeAddress.city",
    "officeAddress.state",
    "officeAddress.postalCode",
    "officeAddress.country",
    "gstNumber",
  ],
};

interface OfficeAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface AgencyUserShape {
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
}

interface AgencyShape {
  companyName?: string;
  tradeName?: string;
  businessType?: ProfileFormValues["businessType"];
  registrationNumber?: string;
  websiteUrl?: string;
  yearsInBusiness?: number;
  iataNumber?: string;
  gstNumber?: string;
  officeAddress?: Partial<OfficeAddress>;
}

interface ProfileFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProfile: any;
}

function mapProfileToFormValues(
  agencyUser?: AgencyUserShape,
  agency?: AgencyShape
): ProfileFormValues {
  return {
    name: agencyUser?.name ?? "",
    phone: agencyUser?.phone ?? "",
    designation: agencyUser?.designation ?? "",
    companyName: agency?.companyName ?? "",
    tradeName: agency?.tradeName ?? "",
    businessType: agency?.businessType ?? "travel_agency",
    registrationNumber: agency?.registrationNumber ?? "",
    websiteUrl: agency?.websiteUrl ?? "",
    yearsInBusiness: agency?.yearsInBusiness ?? 0,
    iataNumber: agency?.iataNumber ?? "",
    gstNumber: agency?.gstNumber ?? "",
    officeAddress: {
      line1: agency?.officeAddress?.line1 ?? "",
      line2: agency?.officeAddress?.line2 ?? "",
      city: agency?.officeAddress?.city ?? "",
      state: agency?.officeAddress?.state ?? "",
      postalCode: agency?.officeAddress?.postalCode ?? "",
      country: agency?.officeAddress?.country ?? "",
    },
  };
}

function extractProfilePayload(response: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = (response as any)?.data ?? response;
  return {
    agencyUser: payload?.agencyUser as AgencyUserShape | undefined,
    agency: payload?.agency as AgencyShape | undefined,
  };
}

const fieldClass = cn(
  "w-full h-11 bg-[#121212] border border-white/[0.1]",
  "text-sm text-white placeholder:text-zinc-500",
  "px-3 rounded-xl outline-none transition-all duration-200",
  "hover:border-[#F8B400]/40 focus:border-[#F8B400]/60 focus:ring-2 focus:ring-[#F8B400]/20"
);

const fieldDisabledClass = cn(
  fieldClass,
  "bg-[#0A0A0A] text-[#71717A] cursor-not-allowed hover:border-white/[0.1] focus:border-white/[0.1] focus:ring-0"
);

const fieldErrorClass = "border-red-500/70 focus:border-red-500 focus:ring-red-500/30";

const labelClass = "text-[13px] font-medium text-[#A1A1AA]";

const formCardClass = cn(
  "relative bg-[var(--ent-card,#171717)] border border-white/[0.08]",
  "rounded-2xl p-5 md:p-6 space-y-5 ent-card-shadow overflow-hidden",
  "before:absolute before:inset-x-0 before:top-0 before:h-px",
  "before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/35 before:to-transparent"
);

const reviewPanelClass =
  "bg-[#121212] border border-white/[0.08] rounded-xl p-4 space-y-2";

function ProfileField({
  label,
  id,
  disabled,
  optional,
  error,
  registration,
  ...inputProps
}: {
  label: string;
  id?: string;
  disabled?: boolean;
  optional?: boolean;
  error?: FieldError;
  registration?: UseFormRegisterReturn;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name">) {
  const inputId = id ?? registration?.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className={labelClass}>
        {label}
        {optional && <span className="font-normal text-zinc-500"> (Optional)</span>}
      </label>
      <input
        id={inputId}
        disabled={disabled}
        {...registration}
        {...inputProps}
        className={cn(
          disabled ? fieldDisabledClass : fieldClass,
          error && !disabled && fieldErrorClass
        )}
      />
      {error && <p className="text-xs font-medium text-red-400">{error.message}</p>}
    </div>
  );
}

function ProfileSelect({
  label,
  id,
  optional,
  error,
  registration,
  children,
}: {
  label: string;
  id?: string;
  optional?: boolean;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  children: React.ReactNode;
}) {
  const selectId = id ?? registration.name;

  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className={labelClass}>
        {label}
        {optional && <span className="font-normal text-zinc-500"> (Optional)</span>}
      </label>
      <select
        id={selectId}
        {...registration}
        className={cn(fieldClass, "cursor-pointer", error && fieldErrorClass)}
      >
        {children}
      </select>
      {error && <p className="text-xs font-medium text-red-400">{error.message}</p>}
    </div>
  );
}

function StepHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-white/[0.08] pb-3">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[#F8B400]/10 text-[#F8B400]">
          <Icon size={14} strokeWidth={2.25} />
        </span>
        {title}
      </h3>
      {description ? <p className="mt-1.5 text-xs text-[#71717A]">{description}</p> : null}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | number | null }) {
  const display = value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <p className="flex justify-between gap-3 text-xs font-medium text-[#71717A]">
      <span>{label}</span>
      <span className="text-right text-white">{display}</span>
    </p>
  );
}

function ProfileForm({ initialProfile }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const agencyUser = initialProfile?.data?.agencyUser || initialProfile?.agencyUser;
  const agency = initialProfile?.data?.agency || initialProfile?.agency;

  const defaultValues = useMemo(
    () => mapProfileToFormValues(agencyUser, agency),
    [agencyUser, agency]
  );

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const values = watch();

  const mutation = useMutation({
    mutationFn: updateAgentProfile,
    onSuccess: (response) => {
      const { agencyUser: updatedUser, agency: updatedAgency } = extractProfilePayload(response);
      if (updatedUser && updatedAgency) {
        reset(mapProfileToFormValues(updatedUser, updatedAgency));
      }
      setSuccessMsg("Profile information updated successfully.");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["agentProfile"] });
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        apiError?.response?.data?.message || "Failed to update profile details. Please try again."
      );
      setSuccessMsg(null);
    },
  });

  const onSubmit = (formValues: ProfileFormValues) => {
    setErrorMsg(null);
    mutation.mutate(formValues);
  };

  const nextStep = async () => {
    const fields = STEP_FIELDS[step];
    if (!fields) return;

    const isValid = await trigger(fields as Parameters<typeof trigger>[0]);
    if (!isValid) return;

    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleStepClick = (stepId: number) => {
    if (completedSteps.includes(stepId) || stepId < step) {
      setStep(stepId);
    }
  };

  const isIndia = values.officeAddress?.country?.toLowerCase() === "india";

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-8">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
            Agency Profile
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Step {step} of {STEPS.length} — manage credentials and verification details.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#F8B400]/25 bg-[#F8B400]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#FFD54A]">
          <Landmark size={12} />
          <span>ID: {agency?.registrationNumber || "Partner"}</span>
        </div>
      </div>

      {successMsg && (
        <div className="flex animate-fade-in items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-300">
          <CheckCircle size={16} className="shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex animate-fade-in items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-300">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={formCardClass}>
        <Stepper
          steps={STEPS}
          currentStep={step}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className={formCardClass}>
        {step === 1 && (
          <div className="space-y-4">
            <StepHeading
              icon={User}
              title="Contact Details"
              description="Primary agent contact for this partner account."
            />
            <div className="space-y-3">
              <ProfileField
                label="Full Name"
                type="text"
                registration={register("name")}
                error={errors.name}
              />
              <ProfileField
                label="Email Address (Read Only)"
                type="email"
                disabled
                value={agencyUser?.email || ""}
                readOnly
              />
              <ProfileField
                label="Phone Number"
                type="tel"
                registration={register("phone")}
                error={errors.phone}
              />
              <ProfileField
                label="Designation"
                type="text"
                optional
                registration={register("designation")}
                error={errors.designation}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <StepHeading
              icon={Building2}
              title="Agency Details"
              description="Legal entity, business type, and registration identifiers."
            />
            <div className="space-y-3">
              <ProfileField
                label="Company Name"
                type="text"
                registration={register("companyName")}
                error={errors.companyName}
              />
              <ProfileField
                label="Trade Name (Brand Name)"
                type="text"
                optional
                registration={register("tradeName")}
                error={errors.tradeName}
              />
              <ProfileSelect
                label="Business Type"
                registration={register("businessType")}
                error={errors.businessType}
              >
                <option value="travel_agency" className="bg-[#171717]">
                  Travel Agency
                </option>
                <option value="tour_operator" className="bg-[#171717]">
                  Tour Operator
                </option>
                <option value="dmc" className="bg-[#171717]">
                  Destination Management Company (DMC)
                </option>
                <option value="freelance_agent" className="bg-[#171717]">
                  Freelance Agent
                </option>
              </ProfileSelect>
              <ProfileField
                label="Registration Number"
                type="text"
                registration={register("registrationNumber")}
                error={errors.registrationNumber}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProfileField
                  label="Years in Business"
                  type="number"
                  min={0}
                  registration={register("yearsInBusiness", { valueAsNumber: true })}
                  error={errors.yearsInBusiness}
                />
                <ProfileField
                  label="IATA Number"
                  type="text"
                  optional
                  registration={register("iataNumber")}
                  error={errors.iataNumber}
                />
              </div>
              <ProfileField
                label="GST Number (India Only)"
                type="text"
                optional
                placeholder="Enter GSTIN if based in India"
                registration={register("gstNumber")}
                error={errors.gstNumber}
              />
              <ProfileField
                label="Website URL"
                type="text"
                optional
                registration={register("websiteUrl")}
                error={errors.websiteUrl}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <StepHeading
              icon={Compass}
              title="Office Address"
              description="Registered or primary office location for correspondence."
            />
            <div className="space-y-3">
              <ProfileField
                label="Address Line 1"
                type="text"
                registration={register("officeAddress.line1")}
                error={errors.officeAddress?.line1}
              />
              <ProfileField
                label="Address Line 2"
                type="text"
                optional
                registration={register("officeAddress.line2")}
                error={errors.officeAddress?.line2}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProfileField
                  label="City"
                  type="text"
                  registration={register("officeAddress.city")}
                  error={errors.officeAddress?.city}
                />
                <ProfileField
                  label="State / Province"
                  type="text"
                  registration={register("officeAddress.state")}
                  error={errors.officeAddress?.state}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProfileField
                  label="Postal Code"
                  type="text"
                  registration={register("officeAddress.postalCode")}
                  error={errors.officeAddress?.postalCode}
                />
                <ProfileField
                  label="Country"
                  type="text"
                  registration={register("officeAddress.country")}
                  error={errors.officeAddress?.country}
                />
              </div>
              {isIndia && values.gstNumber ? (
                <p className="text-[11px] text-[#71717A]">
                  GSTIN on file:{" "}
                  <span className="font-medium text-[#F8B400]">{values.gstNumber}</span>
                  {" — "}
                  edit on the Agency step if needed.
                </p>
              ) : null}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <StepHeading
              icon={ShieldCheck}
              title="Review & Save"
              description="Confirm your profile details before saving changes."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className={reviewPanelClass}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400]">
                  Contact
                </h4>
                <ReviewRow label="Name" value={values.name} />
                <ReviewRow label="Email" value={agencyUser?.email} />
                <ReviewRow label="Phone" value={values.phone} />
                <ReviewRow label="Designation" value={values.designation} />
              </div>
              <div className={reviewPanelClass}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400]">
                  Agency
                </h4>
                <ReviewRow label="Company" value={values.companyName} />
                <ReviewRow label="Trade Name" value={values.tradeName} />
                <ReviewRow
                  label="Business Type"
                  value={BUSINESS_TYPE_LABELS[values.businessType]}
                />
                <ReviewRow label="Registration" value={values.registrationNumber} />
                <ReviewRow label="Years" value={values.yearsInBusiness} />
                <ReviewRow label="IATA" value={values.iataNumber} />
                <ReviewRow label="GST" value={values.gstNumber} />
                <ReviewRow label="Website" value={values.websiteUrl} />
              </div>
              <div className={cn(reviewPanelClass, "sm:col-span-2")}>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400]">
                  Office Address
                </h4>
                <ReviewRow label="Line 1" value={values.officeAddress?.line1} />
                <ReviewRow label="Line 2" value={values.officeAddress?.line2} />
                <ReviewRow label="City" value={values.officeAddress?.city} />
                <ReviewRow label="State" value={values.officeAddress?.state} />
                <ReviewRow label="Postal Code" value={values.officeAddress?.postalCode} />
                <ReviewRow label="Country" value={values.officeAddress?.country} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 border-t border-white/[0.08] pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              disabled={mutation.isPending}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#121212] text-sm font-semibold text-white transition-colors hover:border-[#F8B400]/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={16} aria-hidden />
              Back
            </button>
          ) : null}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className={cn(
                "flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FFD54A] to-[#F8B400] text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(248,180,0,0.3)]",
                step > 1 ? "flex-1" : "w-full"
              )}
            >
              Continue
              <ArrowRight size={16} aria-hidden />
            </button>
          ) : (
            <button
              type="submit"
              disabled={mutation.isPending}
              className={cn(
                "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl",
                "bg-gradient-to-r from-[#FFD54A] to-[#F8B400]",
                "text-sm font-semibold text-black",
                "shadow-[0_4px_20px_rgba(248,180,0,0.25)] transition-all duration-200",
                "hover:from-[#FFE066] hover:to-[#FFC425] hover:-translate-y-0.5",
                "hover:shadow-[0_8px_32px_rgba(248,180,0,0.45)]",
                "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              )}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving profile…
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Update
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["agentProfile"],
    queryFn: getAgentProfile,
  });

  const agency = profileData?.data?.agency || profileData?.agency;
  const agencyName = agency?.companyName || agency?.tradeName || "Partner Agency";

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <Loader2 className="mb-3 size-8 animate-spin text-[#F8B400]" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            Loading Agency Profile…
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell agencyName={agencyName}>
      <ProfileForm initialProfile={profileData} />
    </AppShell>
  );
}
