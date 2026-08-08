"use client";

import { CheckCircle } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function PendingApprovalPage() {
  const handleBackToLogin = () => {
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
      <div className="w-full max-w-md p-8 bg-[#121212] border border-white/5 rounded-3xl shadow-2xl">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Application Pending</h2>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">
          Your B2B partner application is currently pending review by our administration team. 
          We will notify you by email once your application has been verified.
        </p>
        <button
          onClick={handleBackToLogin}
          className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl flex items-center justify-center transition-all"
        >
          Back to Login
        </button>
      </div>
    </main>
  );
}
