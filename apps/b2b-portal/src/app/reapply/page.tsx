"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAgentProfile, getRejectionReason, reapply } from "@/api/auth.api";
import { Loader2, CheckCircle, ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { FormButton } from "@/components/ui/FormButton";
import { ROUTES } from "@/lib/routes";

export default function ReapplyPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isResubmitted, setIsResubmitted] = useState(false);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["agentProfile"],
    queryFn: getAgentProfile,
  });

  const { data: rejectionData, isLoading: isRejectionLoading } = useQuery({
    queryKey: ["rejectionReason"],
    queryFn: getRejectionReason,
  });

  const agency = profile?.data?.agency || profile?.agency;
  const agencyUser = profile?.data?.agencyUser || profile?.agencyUser;
  const reason = rejectionData?.rejectionReason || "No reason specified";

  // Derive initial field values from the fetched profile — avoids setState-in-effect.
  const initialFields = useMemo(() => ({
    name: agencyUser?.name || "",
    email: agencyUser?.email || "",
    phone: agencyUser?.phone || "",
    designation: agencyUser?.designation || "",
    companyName: agency?.companyName || "",
    tradeName: agency?.tradeName || "",
    businessType: agency?.businessType || "travel_agency",
    registrationNumber: agency?.registrationNumber || "",
    country: agency?.country || "",
    gstNumber: agency?.gstNumber || "",
    websiteUrl: agency?.websiteUrl || "",
    yearsInBusiness: agency?.yearsInBusiness || 0,
    iataNumber: agency?.iataNumber || "",
    officeAddress: {
      line1: agency?.officeAddress?.line1 || "",
      line2: agency?.officeAddress?.line2 || "",
      city: agency?.officeAddress?.city || "",
      state: agency?.officeAddress?.state || "",
      postalCode: agency?.officeAddress?.postalCode || "",
      country: agency?.officeAddress?.country || "",
    }
  }), [agencyUser, agency]);

  const [hasLoaded, setHasLoaded] = useState(false);
  const [fields, setFields] = useState<Record<string, unknown>>(initialFields);

  // Sync state once the profile query resolves and loads the agency data
  useEffect(() => {
    if (agencyUser && agency && !hasLoaded) {
      setFields({
        name: agencyUser.name || "",
        email: agencyUser.email || "",
        phone: agencyUser.phone || "",
        designation: agencyUser.designation || "",
        companyName: agency.companyName || "",
        tradeName: agency.tradeName || "",
        businessType: agency.businessType || "travel_agency",
        registrationNumber: agency.registrationNumber || "",
        country: agency.country || "",
        gstNumber: agency.gstNumber || "",
        websiteUrl: agency.websiteUrl || "",
        yearsInBusiness: agency.yearsInBusiness || 0,
        iataNumber: agency.iataNumber || "",
        officeAddress: {
          line1: agency.officeAddress?.line1 || "",
          line2: agency.officeAddress?.line2 || "",
          city: agency.officeAddress?.city || "",
          state: agency.officeAddress?.state || "",
          postalCode: agency.officeAddress?.postalCode || "",
          country: agency.officeAddress?.country || "",
        }
      });
      setHasLoaded(true);
    }
  }, [agencyUser, agency, hasLoaded]);

  const mutation = useMutation({
    mutationFn: reapply,
    onSuccess: () => {
      document.cookie = "agency_status=pending; path=/; max-age=86400;";
      setIsResubmitted(true);
    },
    onError: (err: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errObj = err as any;
      setFormError(
        errObj?.response?.data?.error?.message ||
        errObj?.response?.data?.message ||
        "Failed to reapply. Please verify all fields."
      );
    },
  });

  if (isProfileLoading || isRejectionLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </main>
    );
  }

  if (isResubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
        <div className="w-full max-w-md p-8 bg-[#121212] border border-white/5 rounded-3xl shadow-2xl">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Re-submitted successfully</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Your application was re-submitted successfully. Your application status is now pending review.
          </p>
          <button
            onClick={() => {
              document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
              document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
              document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
              window.location.href = ROUTES.login;
            }}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center justify-center transition-all"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  const getFieldValue = (name: string): string => {
    if (name.startsWith("officeAddress.")) {
      const subKey = name.split(".")[1];
      const addr = fields.officeAddress as Record<string, unknown> || {};
      return (addr[subKey] as string) ?? "";
    }
    return (fields[name] as string) ?? "";
  };

  const handleInputChange = (fieldName: string, value: unknown) => {
    if (fieldName.startsWith("officeAddress.")) {
      const subKey = fieldName.split(".")[1];
      setFields((prev) => ({
        ...prev,
        officeAddress: {
          ...(prev.officeAddress as Record<string, unknown> || {}),
          [subKey]: value
        }
      }));
    } else {
      setFields((prev) => ({ ...prev, [fieldName]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    mutation.mutate(fields);
  };

  interface FormField {
    label: string;
    name: string;
    type: string;
    disabled?: boolean;
    options?: { value: string; label: string }[];
  }

  const sections: { title: string; fields: FormField[] }[] = [
    {
      title: "Contact Information",
      fields: [
        { label: "Full Name", name: "name", type: "text" },
        { label: "Email Address (Read-Only)", name: "email", type: "text", disabled: true },
        { label: "Phone Number", name: "phone", type: "text" },
        { label: "Designation", name: "designation", type: "text" },
      ]
    },
    {
      title: "Company Information",
      fields: [
        { label: "Company Name", name: "companyName", type: "text" },
        { label: "Trade Name", name: "tradeName", type: "text" },
        {
          label: "Business Type",
          name: "businessType",
          type: "select",
          options: [
            { value: "travel_agency", label: "Travel Agency" },
            { value: "tour_operator", label: "Tour Operator" },
            { value: "dmc", label: "Destination Management Company (DMC)" },
            { value: "freelance_agent", label: "Freelance Agent" }
          ]
        },
      ]
    },
    {
      title: "Registration & Additional Details",
      fields: [
        { label: "Registration Number", name: "registrationNumber", type: "text" },
        { label: "Country", name: "country", type: "text" },
        { label: "GST Number", name: "gstNumber", type: "text" },
        { label: "Website URL", name: "websiteUrl", type: "text" },
        { label: "Years in Business", name: "yearsInBusiness", type: "number" },
        { label: "IATA Number", name: "iataNumber", type: "text" },
      ]
    },
    {
      title: "Office Address",
      fields: [
        { label: "Address Line 1", name: "officeAddress.line1", type: "text" },
        { label: "Address Line 2", name: "officeAddress.line2", type: "text" },
        { label: "City", name: "officeAddress.city", type: "text" },
        { label: "State", name: "officeAddress.state", type: "text" },
        { label: "Postal Code", name: "officeAddress.postalCode", type: "text" },
        { label: "Country", name: "officeAddress.country", type: "text" },
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-[#050505] py-12 px-6 flex items-center justify-center text-white">
      <div className="w-full max-w-3xl bg-[#121212] border border-white/5 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6 text-rose-500">
          <ShieldAlert className="w-8 h-8" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Reapply Partner Application</h2>
        </div>

        <p className="text-neutral-400 text-sm mb-6">
          Your previous application was rejected. Please review the reason below, correct your information, and re-submit.
        </p>

        {/* Rejection reason banner */}
        <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Rejection Reason</span>
          <p className="text-sm text-neutral-300 mt-1">{reason}</p>
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest border-b border-white/5 pb-2">
                {section.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {section.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                      {field.label}
                    </label>
                    {field.type === "select" ? (
                      <select
                        value={getFieldValue(field.name)}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full bg-[#121212] border border-neutral-800 text-sm px-4 py-3 rounded-xl outline-none text-white focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={getFieldValue(field.name)}
                        disabled={field.disabled}
                        onChange={(e) =>
                          handleInputChange(
                            field.name,
                            field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value
                          )
                        }
                        className={`w-full bg-neutral-950 border border-neutral-800 text-sm px-4 py-3 rounded-xl outline-none text-white focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all ${
                          field.disabled ? "opacity-50 cursor-not-allowed bg-neutral-900" : ""
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <FormButton
            isLoading={mutation.isPending}
            label="Resubmit Application"
            icon={<ArrowRight size={18} />}
            className="mt-6"
          />
        </form>
      </div>
    </main>
  );
}
