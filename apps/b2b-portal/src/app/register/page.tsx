import { Metadata } from "next";
import RegisterFormClient from "@/features/auth/components/RegisterFormClient";
import { Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Apply for Partnership | TravelAgency B2B",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-[#050505] flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[160px] animate-pulse delay-1000 pointer-events-none" />

      {/* LEFT PANE: Travel Hero & Info (Split: Text Left, Premium Image Right) */}
      <section className="w-full lg:w-3/5 p-8 lg:p-12 xl:p-16 flex flex-col justify-between relative z-10 lg:h-screen lg:overflow-y-auto">
        {/* Branding header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
            T
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-widest text-sm uppercase leading-none">TravelAgency</span>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mt-0.5">B2B Portal</span>
          </div>
        </div>

        {/* Content body */}
        <div className="my-auto py-8 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
          {/* Text Content Area */}
          <div className="xl:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" /> Partner Application
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
              Where Partnerships <br />
              <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent">Create Possibilities</span>
            </h1>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
              Simplify operations, increase efficiency, and deliver exceptional travel experiences together.
            </p>

            {/* Why Partner With Us list */}
            <div className="space-y-3.5 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500">Why Partner With Us?</p>
              <ul className="space-y-2.5">
                {[
                  "Competitive wholesale rates",
                  "Real-time inventory & availability",
                  "Advanced booking management",
                  "Dedicated account support",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Premium Illustration Image Container */}
          <div className="xl:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-amber-500/10 group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <Image
                src="/images/hero/hero-illustration.jpg"
                alt="Travel Illustration"
                fill
                priority
                sizes="(max-w-768px) 100vw, 300px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">
          © 2026 TravelAgency B2B Portal. All rights reserved.
        </div>
      </section>

      {/* RIGHT PANE: Application Form Stepper */}
      <section className="w-full lg:w-2/5 p-6 lg:p-12 xl:p-16 flex items-center justify-center relative z-10 lg:h-screen lg:overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/5 bg-black/20 backdrop-blur-sm">
        <RegisterFormClient />
      </section>
    </main>
  );
}
