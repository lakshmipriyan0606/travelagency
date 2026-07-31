"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerAgent } from "@/api/auth.api";
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase,
  Globe,
  FileText,
  CheckCircle,
  Ban,
  AlertTriangle,
  ShieldAlert,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { FormInput } from "@/components/ui/FormInput";
import { FormButton } from "@/components/ui/FormButton";
import { cn } from "@travelagency/utils";
import { ROUTES } from "@/lib/routes";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(5, "Phone number is required"),
    designation: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    companyName: z.string().min(2, "Company name is required"),
    tradeName: z.string().optional(),
    businessType: z.enum([
      "travel_agency",
      "tour_operator",
      "dmc",
      "freelance_agent",
    ]),
    registrationNumber: z.string().min(2, "Registration number is required"),
    yearsInBusiness: z.number().int().nonnegative().optional().or(z.nan()),
    iataNumber: z.string().optional(),
    country: z.string().min(2, "Country is required"),
    gstNumber: z.string().optional(),
    officeAddress: z.object({
      line1: z.string().min(2, "Address line 1 is required"),
      line2: z.string().optional(),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      postalCode: z.string().min(2, "Postal code is required"),
      country: z.string().min(2, "Country is required"),
    }),
  })
  .refine(
    (data) => {
      if (
        data.country?.toLowerCase() === "india" &&
        (!data.gstNumber || data.gstNumber.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "GST number is required for agencies based in India",
      path: ["gstNumber"],
    }
  );

type RegisterValues = z.infer<typeof registerSchema>;

const STEPS = [
  { id: 1, label: "Contact" },
  { id: 2, label: "Access" },
  { id: 3, label: "Company" },
  { id: 4, label: "Details" },
  { id: 5, label: "Address" },
] as const;

const selectClass =
  "h-11 w-full rounded-xl border border-white/[0.1] bg-[#121212] px-3 text-sm text-white outline-none transition-all focus:border-[#F8B400]/60 focus:ring-2 focus:ring-[#F8B400]/20";

export default function RegisterFormClient() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [regStatus, setRegStatus] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessType: "travel_agency",
      country: "India",
      officeAddress: { country: "India" },
    },
  });

  const selectedCountry = watch("country");

  React.useEffect(() => {
    if (selectedCountry) {
      setValue("officeAddress.country", selectedCountry);
    }
  }, [selectedCountry, setValue]);

  const mutation = useMutation({
    mutationFn: registerAgent,
    onSuccess: () => setRegStatus("SUCCESS"),
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const status = errorObj?.response?.status;
      const errorCode = errorObj?.response?.data?.error?.errorCode;
      if (status === 409 && errorCode) {
        setRegStatus(errorCode);
      } else {
        setError(
          errorObj?.response?.data?.error?.message ||
            errorObj?.response?.data?.message ||
            "Failed to register. Please try again."
        );
      }
    },
  });

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "email", "phone"]);
    } else if (step === 2) {
      isValid = await trigger(["designation", "password"]);
    } else if (step === 3) {
      isValid = await trigger(["companyName", "tradeName", "businessType"]);
    } else if (step === 4) {
      isValid = await trigger([
        "registrationNumber",
        "yearsInBusiness",
        "iataNumber",
      ]);
    }
    if (isValid) setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  const onSubmit = (data: RegisterValues) => {
    setError(null);
    mutation.mutate({
      ...data,
      yearsInBusiness: isNaN(data.yearsInBusiness as number)
        ? undefined
        : data.yearsInBusiness,
    });
  };

  if (regStatus) {
    let title = "";
    let description = "";
    let icon = <CheckCircle className="mx-auto size-14 text-[#F8B400]" />;
    let showLoginLink = true;

    switch (regStatus) {
      case "SUCCESS":
      case "ALREADY_PENDING":
        title = "Application pending";
        description =
          "Your partner application is under review. We’ll email you once it’s verified.";
        showLoginLink = false;
        break;
      case "ALREADY_ACTIVE":
        title = "Account already active";
        description =
          "An active partner account exists for this email. Please sign in.";
        icon = <User className="mx-auto size-14 text-emerald-500" />;
        break;
      case "NEEDS_CORRECTION":
        title = "Correction required";
        description =
          "Your application needs updates. Sign in to review flagged fields.";
        icon = <AlertTriangle className="mx-auto size-14 text-amber-500" />;
        break;
      case "ACCOUNT_SUSPENDED":
        title = "Account suspended";
        description = "Contact B2B support to resolve this status.";
        icon = <Ban className="mx-auto size-14 text-red-500" />;
        showLoginLink = false;
        break;
      case "ACCOUNT_REJECTED":
        title = "Application rejected";
        description = "Sign in to re-submit your registration.";
        icon = <ShieldAlert className="mx-auto size-14 text-rose-500" />;
        break;
    }

    return (
      <div className="w-full rounded-3xl border border-white/[0.08] bg-[#171717] p-6 text-center shadow-2xl">
        <div className="mb-4">{icon}</div>
        <h2 className="mb-2 text-xl font-semibold text-white">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-[#A1A1AA]">{description}</p>
        <Link
          href={ROUTES.login}
          className={cn(
            "inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all",
            showLoginLink
              ? "bg-gradient-to-r from-[#FFD54A] to-[#F8B400] text-black hover:-translate-y-0.5"
              : "text-[#A1A1AA] hover:text-[#FFD54A]"
          )}
        >
          {showLoginLink ? "Go to login" : "Back to login"}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#171717] p-5 shadow-2xl sm:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F8B400]/50 to-transparent" />

      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Create account
        </h2>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Step {step} of {STEPS.length} — join the partner network
        </p>
      </div>

      {/* Compact 5-step stepper */}
      <nav aria-label="Registration steps" className="mb-5">
        <ol className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex min-w-0 flex-1 items-center gap-1">
              <div className="flex min-w-0 flex-col items-center gap-1">
                <div
                  aria-current={step === s.id ? "step" : undefined}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                    step === s.id && "bg-[#F8B400] text-black",
                    step > s.id && "bg-[#22C55E] text-white",
                    step < s.id &&
                      "border border-white/[0.1] bg-[#121212] text-[#71717A]"
                  )}
                >
                  {step > s.id ? "✓" : s.id}
                </div>
                <span
                  className={cn(
                    "truncate text-[10px] font-medium",
                    step === s.id ? "text-[#F8B400]" : "text-[#71717A]"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mb-4 h-px flex-1",
                    step > s.id ? "bg-[#22C55E]" : "bg-white/[0.08]"
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          ))}
        </ol>
      </nav>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-400"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {step === 1 && (
          <div className="space-y-3">
            <FormInput
              registration={register("name")}
              label="Full name"
              placeholder="John Doe"
              icon={User}
              error={errors.name}
            />
            <FormInput
              registration={register("email")}
              label="Work email"
              type="email"
              placeholder="john@agency.com"
              icon={Mail}
              error={errors.email}
            />
            <FormInput
              registration={register("phone")}
              label="Phone"
              placeholder="+1 234 567 890"
              icon={Phone}
              error={errors.phone}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <FormInput
              registration={register("designation")}
              label="Job title (optional)"
              placeholder="Operations Manager"
              icon={Briefcase}
              error={errors.designation}
            />
            <FormInput
              registration={register("password")}
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <FormInput
              registration={register("companyName")}
              label="Legal company name"
              placeholder="Apex Travel Solutions Ltd"
              icon={Building2}
              error={errors.companyName}
            />
            <FormInput
              registration={register("tradeName")}
              label="Trade name (optional)"
              placeholder="Apex Tours"
              icon={Building2}
              error={errors.tradeName}
            />
            <div className="space-y-1.5">
              <label
                htmlFor="businessType"
                className="text-[13px] font-medium text-[#A1A1AA]"
              >
                Business type
              </label>
              <select
                id="businessType"
                {...register("businessType")}
                className={selectClass}
              >
                <option value="travel_agency">Travel Agency</option>
                <option value="tour_operator">Tour Operator</option>
                <option value="dmc">DMC</option>
                <option value="freelance_agent">Freelance Agent</option>
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <FormInput
              registration={register("registrationNumber")}
              label="Registration number"
              placeholder="REG-94810A2"
              icon={FileText}
              error={errors.registrationNumber}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                registration={register("yearsInBusiness", {
                  valueAsNumber: true,
                })}
                label="Years in business"
                type="number"
                placeholder="5"
                error={errors.yearsInBusiness}
              />
              <FormInput
                registration={register("iataNumber")}
                label="IATA (optional)"
                placeholder="IATA-840192"
                error={errors.iataNumber}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="country"
                className="text-[13px] font-medium text-[#A1A1AA]"
              >
                Country
              </label>
              <select id="country" {...register("country")} className={selectClass}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </div>
            {selectedCountry?.toLowerCase() === "india" ? (
              <FormInput
                registration={register("gstNumber")}
                label="GST number"
                placeholder="22AAAAA1111A1Z1"
                icon={FileText}
                error={errors.gstNumber}
              />
            ) : null}
            <FormInput
              registration={register("officeAddress.line1")}
              label="Address line 1"
              placeholder="123 Business Park"
              icon={Globe}
              error={errors.officeAddress?.line1}
            />
            <FormInput
              registration={register("officeAddress.line2")}
              label="Address line 2 (optional)"
              placeholder="Suite 400"
              error={errors.officeAddress?.line2}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                registration={register("officeAddress.city")}
                label="City"
                placeholder="New Delhi"
                error={errors.officeAddress?.city}
              />
              <FormInput
                registration={register("officeAddress.state")}
                label="State"
                placeholder="Delhi"
                error={errors.officeAddress?.state}
              />
            </div>
            <FormInput
              registration={register("officeAddress.postalCode")}
              label="Postal code"
              placeholder="110001"
              error={errors.officeAddress?.postalCode}
            />
          </div>
        )}

        <div className="flex gap-2 border-t border-white/[0.08] pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#121212] text-sm font-semibold text-white transition-colors hover:border-[#F8B400]/40"
            >
              <ArrowLeft size={16} aria-hidden />
              Back
            </button>
          ) : null}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FFD54A] to-[#F8B400] text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(248,180,0,0.3)]"
            >
              Continue
              <ArrowRight size={16} aria-hidden />
            </button>
          ) : (
            <FormButton
              isLoading={isSubmitting || mutation.isPending}
              label="Apply now"
              icon={<ArrowRight size={16} aria-hidden />}
              className="mt-0 h-11 flex-1 rounded-xl !text-sm !normal-case !tracking-normal"
            />
          )}
        </div>
      </form>

      <p className="mt-4 border-t border-white/[0.08] pt-4 text-center text-sm text-[#A1A1AA]">
        Already a partner?{" "}
        <Link
          href={ROUTES.login}
          className="font-semibold text-[#F8B400] hover:text-[#FFD54A]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
