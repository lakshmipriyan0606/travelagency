import { Metadata } from "next";
import { Ban } from "lucide-react";

export const metadata: Metadata = {
  title: "Account Suspended | B2B Portal",
};

export default function SuspendedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505] p-6 text-center">
      <div className="w-full max-w-md p-8 bg-[#121212] border border-white/5 rounded-3xl shadow-2xl">
        <div className="mb-6">
          <Ban className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight mb-4">Account Suspended</h2>
        <p className="text-neutral-400 text-sm leading-relaxed mb-8">
          This partner account has been suspended by administration. 
          Please contact our B2B support team to appeal or resolve this status.
        </p>
        <div className="text-neutral-600 text-xs uppercase tracking-widest font-bold">
          Access Restricted
        </div>
      </div>
    </main>
  );
}
