"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerAgent } from "@/api/auth.api";
import { ArrowRight, ArrowLeft, Lock, Mail, User, Phone, Briefcase, Globe, FileText, CheckCircle, Ban, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { FormInput } from "@/components/ui/FormInput";
import { FormButton } from "@/components/ui/FormButton";
import { cn } from "@travelagency/utils";

// Full Zod validation schema matching the backend registerSchema
const registerSchema = z.object({
  // Contact details
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required"),
  designation: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),

  // Business profile details
  companyName: z.string().min(2, "Company name is required"),
  tradeName: z.string().optional(),
  businessType: z.enum(["travel_agency", "tour_operator", "dmc", "freelance_agent"]),
  registrationNumber: z.string().min(2, "Registration number is required"),
  yearsInBusiness: z.number().int().nonnegative().optional().or(z.nan()),
  iataNumber: z.string().optional(),

  // Location / Address details
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
}).refine(
  (data) => {
    if (data.country?.toLowerCase() === "india" && (!data.gstNumber || data.gstNumber.trim() === "")) {
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
      officeAddress: {
        country: "India"
      }
    }
  });

  const selectedCountry = watch("country");

  // Keep nested address country in sync with the primary country selection
  React.useEffect(() => {
    if (selectedCountry) {
      setValue("officeAddress.country", selectedCountry);
    }
  }, [selectedCountry, setValue]);

  const mutation = useMutation({
    mutationFn: registerAgent,
    onSuccess: () => {
      setRegStatus("SUCCESS");
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorObj = err as any;
      const status = errorObj?.response?.status;
      const errorCode = errorObj?.response?.data?.error?.errorCode;
      if (status === 409 && errorCode) {
        setRegStatus(errorCode);
      } else {
        setError(errorObj?.response?.data?.error?.message || errorObj?.response?.data?.message || "Failed to register. Please try again.");
      }
    }
  });

  const nextStep = async () => {
    // Validate current step fields before letting the user proceed
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["name", "email", "phone", "designation", "password"]);
    } else if (step === 2) {
      isValid = await trigger(["companyName", "tradeName", "businessType", "registrationNumber", "yearsInBusiness", "iataNumber"]);
    }
    if (isValid) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onSubmit = (data: RegisterValues) => {
    setError(null);
    // Sanitize nan out of yearsInBusiness
    const payload = {
      ...data,
      yearsInBusiness: isNaN(data.yearsInBusiness as number) ? undefined : data.yearsInBusiness
    };
    mutation.mutate(payload);
  };

  // Render distinct screens for conflict / success states
  if (regStatus) {
    let title = "";
    let description = "";
    let icon = <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />;
    let showLoginLink = true;

    switch (regStatus) {
      case "SUCCESS":
      case "ALREADY_PENDING":
        title = "Application Pending";
        description = "Your B2B partner application has been submitted successfully and is currently pending review by our administration team. We will notify you by email once your application has been verified.";
        icon = <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />;
        showLoginLink = false;
        break;
      case "ALREADY_ACTIVE":
        title = "Account Already Active";
        description = "An active B2B partner account is already registered with this email address. Please sign in to access the dashboard.";
        icon = <User className="w-16 h-16 text-emerald-500 mx-auto" />;
        break;
      case "NEEDS_CORRECTION":
        title = "Correction Required";
        description = "Your B2B application requires updates. Please sign in to view the flagged fields and resubmit your details for approval.";
        icon = <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto" />;
        break;
      case "ACCOUNT_SUSPENDED":
        title = "Account Suspended";
        description = "This partner account has been suspended by administration. Please contact B2B support to appeal or resolve this status.";
        icon = <Ban className="w-16 h-16 text-red-500 mx-auto" />;
        showLoginLink = false;
        break;
      case "ACCOUNT_REJECTED":
        title = "Application Rejected";
        description = "Your previous partner application was rejected. Please sign in to re-submit your registration form.";
        icon = <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />;
        break;
    }

    return (
      <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl text-center">
        <div className="mb-6">{icon}</div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">{title}</h2>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">{description}</p>
        {showLoginLink ? (
          <Link
            href="/login"
            className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            Go to Login
          </Link>
        ) : (
          <Link
            href="/login"
            className="text-neutral-500 hover:text-neutral-400 text-sm font-medium transition-colors"
          >
            Back to Login
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/10 via-yellow-500/50 to-yellow-500/10"></div>
      
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Partner Application</h2>
        <p className="text-neutral-400 text-sm mt-1">Join our B2B agency network</p>
      </div>

      {/* Stepper Header Component */}
      <div className="flex items-center justify-between mb-10 px-4">
        {[1, 2, 3].map((stepNumber) => (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300",
                  step === stepNumber
                    ? "bg-yellow-500 border-yellow-500 text-neutral-950 shadow-lg shadow-yellow-500/20"
                    : step > stepNumber
                    ? "bg-emerald-600 border-emerald-500 text-white"
                    : "bg-neutral-950 border-neutral-800 text-neutral-500"
                )}
              >
                {step > stepNumber ? "✓" : stepNumber}
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black mt-2 text-neutral-400">
                {stepNumber === 1 ? "Account" : stepNumber === 2 ? "Business" : "Address"}
              </span>
            </div>
            {stepNumber < 3 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-4 -mt-6 transition-all duration-300",
                  step > stepNumber ? "bg-emerald-600" : "bg-neutral-800"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* STEP 1: Account Details */}
        {step === 1 && (
          <div className="space-y-5">
            <FormInput
              registration={register("name")}
              label="Contact Person Name"
              placeholder="John Doe"
              icon={User}
              error={errors.name}
            />

            <FormInput
              registration={register("email")}
              label="Contact Email Address"
              type="email"
              placeholder="john@travelagency.com"
              icon={Mail}
              error={errors.email}
            />

            <FormInput
              registration={register("phone")}
              label="Phone Number"
              placeholder="+1 234 567 890"
              icon={Phone}
              error={errors.phone}
            />

            <FormInput
              registration={register("designation")}
              label="Designation / Job Title"
              placeholder="Operations Manager (Optional)"
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

        {/* STEP 2: Business details */}
        {step === 2 && (
          <div className="space-y-5">
            <FormInput
              registration={register("companyName")}
              label="Company Legal Name"
              placeholder="Apex Travel Solutions Ltd"
              icon={Building2Icon}
              error={errors.companyName}
            />

            <FormInput
              registration={register("tradeName")}
              label="Trade Name (DBA)"
              placeholder="Apex Tours (Optional)"
              icon={Building2Icon}
              error={errors.tradeName}
            />

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Business Type
              </label>
              <select
                {...register("businessType")}
                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              >
                <option value="travel_agency">Travel Agency</option>
                <option value="tour_operator">Tour Operator</option>
                <option value="dmc">Destination Management Company (DMC)</option>
                <option value="freelance_agent">Freelance Travel Agent</option>
              </select>
              {errors.businessType && (
                <p className="text-xs text-red-400 font-medium">{errors.businessType.message}</p>
              )}
            </div>

            <FormInput
              registration={register("registrationNumber")}
              label="Business Registration Number"
              placeholder="REG-94810A2"
              icon={FileText}
              error={errors.registrationNumber}
            />

            <FormInput
              registration={register("yearsInBusiness", { valueAsNumber: true })}
              label="Years In Business"
              type="number"
              placeholder="5"
              error={errors.yearsInBusiness}
            />

            <FormInput
              registration={register("iataNumber")}
              label="IATA Number"
              placeholder="IATA-840192 (Optional)"
              error={errors.iataNumber}
            />
          </div>
        )}

        {/* STEP 3: Office Address */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Country
              </label>
              <select
                {...register("country")}
                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
              {errors.country && (
                <p className="text-xs text-red-400 font-medium">{errors.country.message}</p>
              )}
            </div>

            {selectedCountry?.toLowerCase() === "india" && (
              <FormInput
                registration={register("gstNumber")}
                label="GST Number"
                placeholder="22AAAAA1111A1Z1"
                icon={FileText}
                error={errors.gstNumber}
              />
            )}

            <FormInput
              registration={register("officeAddress.line1")}
              label="Address Line 1"
              placeholder="123 Business Park, Block B"
              icon={Globe}
              error={errors.officeAddress?.line1}
            />

            <FormInput
              registration={register("officeAddress.line2")}
              label="Address Line 2"
              placeholder="Suite 400 (Optional)"
              icon={Globe}
              error={errors.officeAddress?.line2}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput
                registration={register("officeAddress.city")}
                label="City"
                placeholder="New Delhi"
                error={errors.officeAddress?.city}
              />
              <FormInput
                registration={register("officeAddress.state")}
                label="State / Region"
                placeholder="Delhi"
                error={errors.officeAddress?.state}
              />
            </div>

            <FormInput
              registration={register("officeAddress.postalCode")}
              label="Postal / ZIP Code"
              placeholder="110001"
              error={errors.officeAddress?.postalCode}
            />
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex gap-4 pt-4 border-t border-neutral-800/50">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <FormButton
              isLoading={isSubmitting || mutation.isPending}
              label="Apply Now"
              icon={<ArrowRight size={18} />}
            />
          )}
        </div>
      </form>

      <div className="mt-8 text-center text-sm text-neutral-400">
        Already a partner?{" "}
        <Link href="/login" className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}

// Inline fallback icon for Company name input
function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}
