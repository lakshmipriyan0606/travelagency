import { Metadata } from "next";
import LoginFormClient from "@/features/auth/components/LoginFormClient";
import { Sparkles, CheckCircle2, Sun } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | TravelAgency B2B",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-[#090909] flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Luxury Background Glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#F8B400]/5 rounded-full blur-[180px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#FFD54A]/3 rounded-full blur-[180px] animate-pulse delay-1000 pointer-events-none" />

      {/* Subtle Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 rounded-full bg-[#F8B400]/20 animate-ping delay-100" />
        <div className="absolute top-[60%] left-[30%] w-1 h-1 rounded-full bg-[#FFD54A]/30 animate-pulse delay-300" />
        <div className="absolute bottom-[30%] left-[15%] w-1.5 h-1.5 rounded-full bg-[#F8B400]/15 animate-ping delay-700" />
        <div className="absolute top-[40%] right-[40%] w-1 h-1 rounded-full bg-[#FFD54A]/25 animate-pulse delay-500" />
      </div>

      {/* LEFT PANEL (65% width on desktop) */}
      <section className="w-full lg:w-[65%] p-6 lg:p-12 xl:p-16 flex flex-col justify-between relative z-10 lg:h-screen lg:overflow-y-auto">
        {/* Header containing Logo & Theme Toggle */}
        <div className="flex items-center justify-between w-full mb-8 lg:mb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFD54A] to-[#F8B400] flex items-center justify-center font-black text-black text-lg shadow-lg shadow-[#F8B400]/20">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black tracking-widest text-sm uppercase leading-none">TravelAgency</span>
              <span className="text-[9px] text-[#F8B400] font-bold uppercase tracking-widest mt-0.5">B2B Portal</span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <Sun size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="my-auto py-8 flex flex-col items-center xl:flex-row xl:gap-12">
          {/* Main Info Columns */}
          <div className="w-full xl:w-7/12 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F8B400]/10 border border-[#F8B400]/20 rounded-full text-[#FFD54A] text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" /> Luxury Travel Solutions
            </div>
            <h1 className="text-5xl xl:text-[64px] font-extrabold text-white tracking-tight leading-[1.05] mb-4">
              Your Journey. <br />
              <span className="bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#FFD54A] bg-clip-text text-transparent">Starts Here.</span>
            </h1>
            <p className="text-[#B4B4B4] text-lg leading-relaxed max-w-lg">
              Access exclusive wholesale pricing, manage quotations, track bookings, and grow your travel business.
            </p>

            {/* 4 Premium Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                "Real-time quotations",
                "Dedicated account manager",
                "Instant booking updates",
                "Secure B2B pricing",
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <CheckCircle2 size={16} className="text-[#F8B400] shrink-0" />
                  <span className="text-xs font-semibold text-neutral-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Large Premium Travel Illustration (Occupies around 70% height area) */}
          <div className="w-full xl:w-5/12 flex justify-center mt-8 xl:mt-0">
            <div className="relative w-full max-w-[320px] aspect-[4/5] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl shadow-[#F8B400]/5 group animate-float">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              <Image
                src="/images/hero/hero-illustration.jpg"
                alt="B2B Travel Illustration"
                fill
                priority
                sizes="(max-w-768px) 100vw, 320px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold mt-8 lg:mt-0">
          © 2026 TravelAgency B2B Portal. All rights reserved.
        </div>
      </section>

      {/* RIGHT PANEL (35% width on desktop) */}
      <section className="w-full lg:w-[35%] p-6 lg:p-12 flex items-center justify-center relative z-10 lg:h-screen lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 backdrop-blur-sm">
        <LoginFormClient />
      </section>
    </main>
  );
}
