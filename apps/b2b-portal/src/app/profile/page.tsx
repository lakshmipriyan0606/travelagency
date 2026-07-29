"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAgentProfile, updateAgentProfile } from "@/api/auth.api";
import { Loader2, CheckCircle, AlertCircle, Save, Building2, User, Landmark, Compass } from "lucide-react";
import AppShell from "@/components/layout/AppShell";

interface OfficeAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ProfileFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialProfile: any;
}

function ProfileForm({ initialProfile }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const agencyUser = initialProfile?.data?.agencyUser || initialProfile?.agencyUser;
  const agency = initialProfile?.data?.agency || initialProfile?.agency;

  // Local state initialized synchronously
  const [formState, setFormState] = useState({
    name: agencyUser?.name || "",
    phone: agencyUser?.phone || "",
    designation: agencyUser?.designation || "",
    companyName: agency?.companyName || "",
    tradeName: agency?.tradeName || "",
    businessType: agency?.businessType || "travel_agency",
    registrationNumber: agency?.registrationNumber || "",
    websiteUrl: agency?.websiteUrl || "",
    yearsInBusiness: agency?.yearsInBusiness || 0,
    iataNumber: agency?.iataNumber || "",
    gstNumber: agency?.gstNumber || "",
    officeAddress: {
      line1: agency?.officeAddress?.line1 || "",
      line2: agency?.officeAddress?.line2 || "",
      city: agency?.officeAddress?.city || "",
      state: agency?.officeAddress?.state || "",
      postalCode: agency?.officeAddress?.postalCode || "",
      country: agency?.officeAddress?.country || "",
    } as OfficeAddress,
  });

  // Mutation to update the profile
  const mutation = useMutation({
    mutationFn: updateAgentProfile,
    onSuccess: () => {
      setSuccessMsg("Profile information updated successfully.");
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey: ["agentProfile"] });
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(apiError?.response?.data?.message || "Failed to update profile details. Please try again.");
      setSuccessMsg(null);
    },
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field: keyof OfficeAddress, value: string) => {
    setFormState((prev) => ({
      ...prev,
      officeAddress: {
        ...prev.officeAddress,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formState);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-6 border-b border-border flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Agency Profile</h1>
          <p className="text-xs text-text-secondary mt-1">Manage credentials, details, and verification metrics.</p>
        </div>
        <div className="px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-wider text-primary-accent flex items-center gap-1.5 shadow-sm">
          <Landmark size={12} />
          <span>ID: {agency?.registrationNumber || "Partner"}</span>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-semibold shadow-sm animate-fade-in">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-800 text-xs font-semibold shadow-sm animate-fade-in">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: User Details */}
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-premium">
          <div className="border-b border-border pb-4 flex items-center gap-2">
            <User size={16} className="text-primary-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Agent Contact Details</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Full Name</label>
              <input
                type="text"
                required
                value={formState.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Email Address (Read Only)</label>
              <input
                type="email"
                disabled
                value={agencyUser?.email || ""}
                className="w-full bg-neutral-100 border border-neutral-200 text-text-secondary text-sm px-4 py-3 rounded-xl outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Phone Number</label>
              <input
                type="text"
                required
                value={formState.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Designation</label>
              <input
                type="text"
                value={formState.designation}
                onChange={(e) => handleInputChange("designation", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Company Details */}
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-premium">
          <div className="border-b border-border pb-4 flex items-center gap-2">
            <Building2 size={16} className="text-primary-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Agency Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Company Name</label>
              <input
                type="text"
                required
                value={formState.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Trade Name (Brand Name)</label>
              <input
                type="text"
                value={formState.tradeName}
                onChange={(e) => handleInputChange("tradeName", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Business Type</label>
              <select
                value={formState.businessType}
                onChange={(e) => handleInputChange("businessType", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              >
                <option value="travel_agency">Travel Agency</option>
                <option value="tour_operator">Tour Operator</option>
                <option value="dmc">Destination Management Company (DMC)</option>
                <option value="freelance_agent">Freelance Agent</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Registration Number</label>
              <input
                type="text"
                required
                value={formState.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">GST Number (India Only)</label>
              <input
                type="text"
                value={formState.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                placeholder="Enter GSTIN if based in India"
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">IATA Number (Optional)</label>
              <input
                type="text"
                value={formState.iataNumber}
                onChange={(e) => handleInputChange("iataNumber", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Website URL</label>
              <input
                type="text"
                value={formState.websiteUrl}
                onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Years in Business</label>
              <input
                type="number"
                value={formState.yearsInBusiness}
                onChange={(e) => handleInputChange("yearsInBusiness", Number(e.target.value))}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Office Address */}
        <div className="bg-white border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-premium">
          <div className="border-b border-border pb-4 flex items-center gap-2">
            <Compass size={16} className="text-primary-accent" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">Office Address</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Address Line 1</label>
              <input
                type="text"
                required
                value={formState.officeAddress.line1}
                onChange={(e) => handleAddressChange("line1", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={formState.officeAddress.line2}
                onChange={(e) => handleAddressChange("line2", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">City</label>
              <input
                type="text"
                required
                value={formState.officeAddress.city}
                onChange={(e) => handleAddressChange("city", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">State / Province</label>
              <input
                type="text"
                required
                value={formState.officeAddress.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Postal Code</label>
              <input
                type="text"
                required
                value={formState.officeAddress.postalCode}
                onChange={(e) => handleAddressChange("postalCode", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Country</label>
              <input
                type="text"
                required
                value={formState.officeAddress.country}
                onChange={(e) => handleAddressChange("country", e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 text-text-primary focus:border-neutral-300 text-sm px-4 py-3 rounded-xl outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary-accent hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition shadow-md disabled:opacity-50"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Saving profile...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  // Fetch the agent profile details
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["agentProfile"],
    queryFn: getAgentProfile,
  });

  const agencyUser = profileData?.data?.agencyUser || profileData?.agencyUser;

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-primary-accent mb-3" size={32} />
          <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Loading Agency Profile...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={{ name: agencyUser?.name || "Agent Partner", email: agencyUser?.email }}>
      <ProfileForm initialProfile={profileData} />
    </AppShell>
  );
}
