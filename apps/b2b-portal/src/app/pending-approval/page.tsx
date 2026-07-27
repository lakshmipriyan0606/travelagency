import { Metadata } from "next";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Application Pending | B2B Portal",
};

export default function PendingApprovalPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 p-6 text-center">
      <div className="w-full max-w-md p-8 bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-yellow-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Application Pending</h2>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">
          Your B2B partner application is currently pending review by our administration team. 
          We will notify you by email once your application has been verified.
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
