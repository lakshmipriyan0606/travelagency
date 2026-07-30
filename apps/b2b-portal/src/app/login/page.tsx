import { Metadata } from "next";
import LoginFormClient from "@/features/auth/components/LoginFormClient";
import { Sparkles, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login | TravelAgency B2B",
  description: "Access your B2B travel partner portal for exclusive wholesale pricing and real-time bookings.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row relative overflow-hidden font-sans" style={{ background: "#080810" }}>

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
          animationDelay: "2s",
        }}
      />
      {/* Accent glow — center */}
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

      {/* ─── LEFT PANEL (65% desktop) ─── */}
      <section className="w-full lg:w-[65%] p-6 lg:p-12 xl:p-16 flex flex-col justify-between relative z-10 lg:h-screen lg:overflow-y-auto">

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
              Luxury Travel Solutions
            </div>

            {/* Headline */}
            <h1 className="text-5xl xl:text-[62px] font-extrabold text-white tracking-tight leading-[1.05]">
              Your Journey.<br />
              <span
                style={{
                  background: "linear-gradient(90deg, #FFD54A 0%, #F8B400 50%, #FFD54A 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Starts Here.
              </span>
            </h1>

            <p style={{ color: "#9ca3af" }} className="text-lg leading-relaxed max-w-lg">
              Access exclusive wholesale pricing, manage quotations,<br />
              track bookings, and grow your travel business.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Real-time quotations",
                "Dedicated account manager",
                "Instant booking updates",
                "Secure B2B pricing",
              ].map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <CheckCircle2 size={16} className="shrink-0" style={{ color: "#F8B400" }} />
                  <span className="text-xs font-semibold" style={{ color: "#d1d5db" }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="w-full xl:w-5/12 flex justify-center mt-10 xl:mt-0">
            {/* Outer glow ring */}
            <div
              className="relative animate-float"
              style={{
                filter: "drop-shadow(0 0 40px rgba(248,180,0,0.25)) drop-shadow(0 0 80px rgba(248,180,0,0.1))",
              }}
            >
              <div
                className="relative overflow-hidden group"
                style={{
                  width: "min(320px, 90vw)",
                  aspectRatio: "4/5",
                  borderRadius: "28px",
                  border: "1px solid rgba(248,180,0,0.2)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.6)",
                }}
              >
                {/* Inner gradient overlay at bottom */}
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
                  alt="B2B Travel Illustration — luxury gateway to global destinations"
                  fill
                  priority
                  sizes="320px"
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

      {/* ─── RIGHT PANEL (35% desktop) — Login Form ─── */}
      <section
        className="w-full lg:w-[35%] p-6 lg:p-12 flex items-center justify-center relative z-10 lg:h-screen lg:overflow-y-auto"
        style={{
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <LoginFormClient />
      </section>
    </main>
  );
}
