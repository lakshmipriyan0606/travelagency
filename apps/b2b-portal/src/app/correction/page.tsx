"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAgentProfile, getIssues, resubmitCorrection } from "@/api/auth.api";
import { Loader2, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Issue {
  field: string;
  message: string;
}

export default function CorrectionPage() {
  const [correctedFields, setCorrectedFields] = useState<Record<string, any>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isResubmitted, setIsResubmitted] = useState(false);

  // Fetch agent profile (contains agency) and open issues
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["agentProfile"],
    queryFn: getAgentProfile,
  });

  const { data: issuesData, isLoading: isIssuesLoading } = useQuery({
    queryKey: ["agencyIssues"],
    queryFn: getIssues,
  });

  const agency = profile?.user?.agency;
  const issuesList: Issue[] = issuesData?.issues || [];

  // Initialize correctedFields with existing values once profile loads
  useEffect(() => {
    if (agency) {
      setCorrectedFields({
        companyName: agency.companyName || "",
        tradeName: agency.tradeName || "",
        businessType: agency.businessType || "travel_agency",
        registrationNumber: agency.registrationNumber || "",
        country: agency.country || "",
        gstNumber: agency.gstNumber || "",
        websiteUrl: agency.websiteUrl || "",
        yearsInBusiness: agency.yearsInBusiness || 0,
        iataNumber: agency.iataNumber || "",
      });
    }
  }, [agency]);

  const mutation = useMutation({
    mutationFn: resubmitCorrection,
    onSuccess: () => {
      // Flip status cookie to pending and show confirmation
      document.cookie = "agency_status=pending; path=/; max-age=86400;";
      setIsResubmitted(true);
    },
    onError: (err: any) => {
      setFormError(
        err?.response?.data?.error?.message || 
        err?.response?.data?.message || 
        "Failed to resubmit application. Please verify your fields."
      );
    },
  });

  if (isProfileLoading || isIssuesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </main>
    );
  }

  if (isResubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 text-center">
        <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-blue-500 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Resubmitted successfully</h2>
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Your corrections have been submitted. Your application status is now pending review.
          </p>
          <Link
            href="/login"
            className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center transition-all"
          >
            Back to Login
          </Link>
        </div>
      </main>
    );
  }

  // Helper to determine if a field is flagged as having issues
  const isFieldFlaged = (fieldName: string) => {
    return issuesList.some((issue) => issue.field === fieldName);
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setCorrectedFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Build payload containing only the flagged/corrected fields
    const payload: Record<string, any> = {};
    issuesList.forEach((issue) => {
      payload[issue.field] = correctedFields[issue.field];
    });

    mutation.mutate(payload);
  };

  return (
    <main className="min-h-screen bg-neutral-950 py-12 px-6 flex items-center justify-center text-white">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3 mb-6 text-amber-500">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="text-2xl font-bold tracking-tight text-white">Action Required: Correction Needed</h2>
        </div>

        <p className="text-neutral-400 text-sm mb-8">
          The B2B compliance team reviewed your application and flagged the following issues. 
          Please correct the highlighted fields and resubmit.
        </p>

        {/* Display issues list */}
        <div className="space-y-3 mb-8">
          {issuesList.map((issue, idx) => (
            <div key={idx} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{issue.field}</span>
              <p className="text-sm text-neutral-300 mt-1">{issue.message}</p>
            </div>
          ))}
        </div>

        {formError && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Field list */}
            {[
              { label: "Company Name", name: "companyName", type: "text" },
              { label: "Trade Name", name: "tradeName", type: "text" },
              { label: "Registration Number", name: "registrationNumber", type: "text" },
              { label: "Country", name: "country", type: "text" },
              { label: "GST Number", name: "gstNumber", type: "text" },
              { label: "Website URL", name: "websiteUrl", type: "text" },
              { label: "Years in Business", name: "yearsInBusiness", type: "number" },
              { label: "IATA Number", name: "iataNumber", type: "text" },
            ].map((field) => {
              const flagged = isFieldFlaged(field.name);
              return (
                <div key={field.name} className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                    {field.label}
                    {flagged && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">Needs Fix</span>}
                  </label>
                  <input
                    type={field.type}
                    value={correctedFields[field.name] ?? ""}
                    onChange={(e) => handleInputChange(field.name, field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
                    disabled={!flagged}
                    className={`w-full bg-neutral-950 border text-sm px-4 py-3 rounded-xl outline-none transition-all ${
                      flagged
                        ? "border-amber-500/50 text-white focus:ring-2 focus:ring-amber-500/30"
                        : "border-neutral-800/80 text-neutral-500 cursor-not-allowed opacity-60"
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 mt-6 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Corrections <ArrowRight size={18} /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
