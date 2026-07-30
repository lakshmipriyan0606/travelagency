import { Metadata } from "next";
import RegisterFormClient from "@/features/auth/components/RegisterFormClient";
import { Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Apply for Partnership | TravelAgency B2B",
  description: "Join our B2B travel agency network and unlock exclusive wholesale pricing, real-time bookings, and dedicated support.",
};

export default function RegisterPage() {
  return (
    <main
      className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden font-sans"
      style={{ background: "#080810" }}
    >
      {/* ─── Immersive Background Layer ─── */}
      <div className="absolute inset-0 pointer-events-none login-grid-bg opacity-60" />

      {/* Primary gold radial glow — top-left */}
      <div
        className="absolute pointer-events-none animate-gold-glow"
        style={{
          top: "-20%",
          left: "-10%",
          width: "55%",
          height: "55%",
          background: "radial-gradient(ellipse, rgba(248,180,0,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Secondary glow — bottom-right */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-20%",
          right: "0%",
          width: "45%",
          height: "50%",
          background: "radial-gradient(ellipse, rgba(255,200,60,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Accent violet glow — center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "30%",
          left: "30%",
          width: "40%",
          height: "40%",
          background: "radial-gradient(ellipse, rgba(99,60,200,0.06) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[18%] left-[8%]  w-1.5 h-1.5 rounded-full bg-[#F8B400]/25 animate-ping" style={{ animationDelay: "0.1s", animationDuration: "3s" }} />
        <div className="absolute top-[55%] left-[25%] w-1 h-1 rounded-full bg-[#FFD54A]/35 animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-[28%] left-[12%] w-1.5 h-1.5 rounded-full bg-[#F8B400]/20 animate-ping" style={{ animationDelay: "1s", animationDuration: "4s" }} />
        <div className="absolute top-[38%] left-[50%] w-1 h-1 rounded-full bg-[#FFD54A]/20 animate-pulse" style={{ animationDelay: "0.7s" }} />
        <div className="absolute top-[70%] left-[60%] w-1 h-1 rounded-full bg-[#F8B400]/15 animate-ping" style={{ animationDelay: "1.5s", animationDuration: "5s" }} />
        <div className="absolute top-[10%] left-[55%] w-1 h-1 rounded-full bg-[#FFD54A]/20 animate-pulse" style={{ animationDelay: "0.3s" }} />
      </div>

      {/* ─── LEFT PANEL (60% desktop) ─── */}
      <section className="w-full lg:w-[60%] p-6 lg:p-12 xl:p-16 flex flex-col justify-between relative z-10 lg:h-screen lg:overflow-y-auto">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-black text-lg"
            style={{
              background: "linear-gradient(135deg, #FFD54A 0%, #F8B400 100%)",
              boxShadow: "0 4px 20px rgba(248,180,0,0.35)",
            }}
          >
            T
          </div>
          <div className="flex flex-col">
            <span className="text-white font-black tracking-widest text-sm uppercase leading-none">TravelAgency</span>
            <span className="text-[9px] text-[#F8B400] font-bold uppercase tracking-widest mt-0.5">B2B Portal</span>
          </div>
        </div>

        {/* Content body */}
        <div className="my-auto py-10 flex flex-col items-center xl:flex-row xl:gap-12">

          {/* Text + Features */}
          <div className="w-full xl:w-7/12 space-y-7">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: "rgba(248,180,0,0.1)",
                border: "1px solid rgba(248,180,0,0.25)",
                color: "#FFD54A",
              }}
            >
              <Sparkles size={12} className="animate-pulse" />
              Partner Application
            </div>

            {/* Headline */}
            <h1 className="text-4xl xl:text-[54px] font-extrabold text-white tracking-tight leading-[1.08]">
              Where Partnerships<br />
              <span
                style={{
                  background: "linear-gradient(90deg, #FFD54A 0%, #F8B400 50%, #FFD54A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Create Possibilities
              </span>
            </h1>

            <p style={{ color: "#9ca3af" }} className="text-base leading-relaxed max-w-md">
              Simplify operations, increase efficiency, and deliver exceptional travel experiences together.
            </p>

            {/* Why Partner list */}
            <div className="space-y-4 pt-1">
              <p
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#F8B400" }}
              >
                Why Partner With Us?
              </p>
              <ul className="space-y-3">
                {[
                  "Competitive wholesale rates",
                  "Real-time inventory & availability",
                  "Advanced booking management",
                  "Dedicated account support",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "rgba(248,180,0,0.12)", border: "1px solid rgba(248,180,0,0.3)" }}
                    >
                      <CheckCircle2 size={11} style={{ color: "#F8B400" }} />
                    </div>
                    <span className="text-sm font-medium" style={{ color: "#d1d5db" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="w-full xl:w-5/12 flex justify-center mt-10 xl:mt-0">
            <div
              className="relative animate-float"
              style={{
                filter: "drop-shadow(0 0 40px rgba(248,180,0,0.25)) drop-shadow(0 0 80px rgba(248,180,0,0.1))",
              }}
            >
              <div
                className="relative overflow-hidden group"
                style={{
                  width: "min(290px, 90vw)",
                  aspectRatio: "4/5",
                  borderRadius: "28px",
                  border: "1px solid rgba(248,180,0,0.2)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.6)",
                }}
              >
                {/* Bottom gradient overlay */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(8,8,16,0.85) 0%, rgba(8,8,16,0.1) 50%, transparent 100%)",
                  }}
                />
                {/* Corner gold accent lines */}
                <div className="absolute top-3 left-3 w-5 h-5 z-20 pointer-events-none"
                  style={{ borderTop: "2px solid rgba(248,180,0,0.6)", borderLeft: "2px solid rgba(248,180,0,0.6)", borderRadius: "4px 0 0 0" }} />
                <div className="absolute top-3 right-3 w-5 h-5 z-20 pointer-events-none"
                  style={{ borderTop: "2px solid rgba(248,180,0,0.6)", borderRight: "2px solid rgba(248,180,0,0.6)", borderRadius: "0 4px 0 0" }} />
                <div className="absolute bottom-3 left-3 w-5 h-5 z-20 pointer-events-none"
                  style={{ borderBottom: "2px solid rgba(248,180,0,0.6)", borderLeft: "2px solid rgba(248,180,0,0.6)", borderRadius: "0 0 0 4px" }} />
                <div className="absolute bottom-3 right-3 w-5 h-5 z-20 pointer-events-none"
                  style={{ borderBottom: "2px solid rgba(248,180,0,0.6)", borderRight: "2px solid rgba(248,180,0,0.6)", borderRadius: "0 0 4px 0" }} />

                <Image
                  src="/images/hero/hero-illustration.jpg"
                  alt="Travel partnership illustration — luxury gateway to global destinations"
                  fill
                  priority
                  sizes="290px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[10px] uppercase tracking-widest font-bold mt-8 lg:mt-0" style={{ color: "#374151" }}>
          © 2026 TravelAgency B2B Portal. All rights reserved.
        </div>
      </section>

      {/* ─── RIGHT PANEL (40% desktop) — Registration Form ─── */}
      <section
        className="w-full lg:w-[40%] flex items-start justify-center relative z-10 lg:h-screen lg:overflow-y-auto py-10 px-6 lg:px-8"
        style={{
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <RegisterFormClient />
      </section>
    </main>
  );
}
