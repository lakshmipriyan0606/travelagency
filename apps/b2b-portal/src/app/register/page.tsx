import { Metadata } from "next";
import RegisterFormClient from "@/features/auth/components/RegisterFormClient";
import { Building2, Calendar, Headset, Sparkles, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Apply for Partnership | TravelAgency B2B",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-neutral-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[160px] animate-pulse delay-1000 pointer-events-none" />

      {/* LEFT PANE: Travel Hero & Info */}
      <section className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative z-10 lg:h-screen lg:overflow-y-auto">
        {/* Branding header */}
        <div className="flex items-center gap-3 mb-12 lg:mb-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
            T
          </div>
          <span className="text-white font-black tracking-widest text-sm uppercase">TravelAgency</span>
        </div>

        {/* Content body */}
        <div className="my-auto max-w-xl py-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={12} className="animate-spin-slow" /> Partner Program
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05] mb-6">
            Become Our <br />
            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Partner</span>
          </h1>
          <p className="text-neutral-400 text-base leading-relaxed mb-10 max-w-lg">
            Expand your inventory, optimize bookings, and unlock specialized agent commissions by joining our network.
          </p>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Building2 size={18} />
              </div>
              <p className="text-2xl font-black text-white leading-none">500+</p>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-2">Global Agencies</p>
              <p className="text-[10px] text-neutral-500 mt-1">Active partners currently in our B2B network.</p>
            </div>

            <div className="p-5 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Calendar size={18} />
              </div>
              <p className="text-2xl font-black text-white leading-none">50K+</p>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-2">Successful Bookings</p>
              <p className="text-[10px] text-neutral-500 mt-1">Completed trips managed through the portal.</p>
            </div>

            <div className="p-5 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Headset size={18} />
              </div>
              <p className="text-2xl font-black text-white leading-none">24×7</p>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-2">Dedicated Support</p>
              <p className="text-[10px] text-neutral-500 mt-1">Round-the-clock helpdesk for active agents.</p>
            </div>

            <div className="p-5 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Globe2 size={18} />
              </div>
              <p className="text-2xl font-black text-white leading-none">100%</p>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-2">Digital Workflow</p>
              <p className="text-[10px] text-neutral-500 mt-1">Paperless application and automatic payouts.</p>
            </div>
          </div>
        </div>

        <div className="text-neutral-600 text-[10px] uppercase tracking-widest font-black mt-12 lg:mt-0">
          © 2026 TravelAgency B2B Portal. All rights reserved.
        </div>
      </section>

      {/* RIGHT PANE: Application Form Stepper */}
      <section className="w-full lg:w-1/2 p-6 lg:p-16 flex items-center justify-center relative z-10 lg:h-screen lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 backdrop-blur-sm">
        <RegisterFormClient />
      </section>
    </main>
  );
}
