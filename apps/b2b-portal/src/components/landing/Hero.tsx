"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  ArrowRight,
  UserPlus,
  Percent,
  Calendar,
  PhoneCall,
  ShieldCheck,
  Briefcase,
  Globe,
  Users,
  BadgeCheck,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const floatingCardVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.35 + i * 0.12,
      duration: 0.65,
    },
  }),
};

const STATS = [
  { icon: Users, value: "12K+", label: "Active Agencies" },
  { icon: Globe, value: "250+", label: "Global Destinations" },
  { icon: BadgeCheck, value: "98%", label: "Partner Satisfaction" },
  { icon: PhoneCall, value: "24/7", label: "Business Support" },
] as const;

const FEATURES = [
  {
    icon: Percent,
    title: "Exclusive Rates",
    desc: "Best wholesale rates for your business",
  },
  {
    icon: Calendar,
    title: "Easy Management",
    desc: "Streamline bookings and operations",
  },
  {
    icon: PhoneCall,
    title: "Dedicated Support",
    desc: "We're here to support your growth",
  },
] as const;

export default function Hero() {
  return (
    <section className="relative h-dvh max-h-dvh w-full bg-[#050505] text-white overflow-hidden flex flex-col selection:bg-[#FFB400] selection:text-black">
      {/* Ambient glow — visual atmosphere without extra height */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(255,180,0,0.08),transparent_55%)]"
      />

      {/* Header */}
      <header className="relative z-30 shrink-0 w-full max-w-7xl mx-auto px-5 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FFB400] to-[#FFD66B] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFB400]/10">
            <Building2 className="text-[#050505]" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none">
              TravelAgency
            </span>
            <span className="text-[8px] sm:text-[9px] uppercase font-bold text-[#FFB400] tracking-widest mt-0.5">
              B2B Portal
            </span>
          </div>
        </div>
      </header>

      {/* Main — fills remaining space above footer */}
      <div className="relative z-20 flex-1 min-h-0 w-full max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center py-2 sm:py-3 [@media(max-height:760px)]:py-1">
        {/* Left copy */}
        <motion.div
          className="lg:col-span-5 flex flex-col justify-center gap-5 sm:gap-6 [@media(max-height:760px)]:gap-3.5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-2.5 sm:space-y-3" variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold tracking-tight text-white leading-[1.12] [@media(max-height:760px)]:text-3xl lg:[@media(max-height:760px)]:text-4xl">
              Your Trusted Travel{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB400] to-[#FFD66B]">
                Partnership Starts Here
              </span>
            </h1>
            <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md font-light [@media(max-height:760px)]:text-sm [@media(max-height:700px)]:line-clamp-2">
              Access exclusive wholesale rates, manage bookings, and grow your
              business with our powerful B2B platform.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-3"
            variants={itemVariants}
          >
            <Link href={ROUTES.login}>
              <button
                type="button"
                className="bg-gradient-to-r from-[#FFB400] to-[#FFD66B] hover:from-[#FFD66B] hover:to-[#FFB400] text-black font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm flex items-center gap-2 transition duration-300 shadow-lg shadow-[#FFB400]/15"
              >
                <Briefcase size={15} />
                <span>Partner Login</span>
                <ArrowRight size={15} />
              </button>
            </Link>

            <Link href={ROUTES.register}>
              <button
                type="button"
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full text-sm flex items-center gap-2 transition duration-300"
              >
                <UserPlus size={15} />
                <span>Apply for Partnership</span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right visual */}
        <div className="lg:col-span-7 relative hidden lg:flex items-center justify-center min-h-0 h-full max-h-full">
          <motion.div
            className="relative z-10 w-full max-w-[min(520px,42dvh)] aspect-[11/10] select-none"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src="/images/hero/hero-illustration.jpg"
              alt="B2B Travel Illustration"
              fill
              priority
              sizes="(max-width: 1024px) 0px, min(520px, 42dvh)"
              className="object-contain rounded-[28px] border border-[#FFB400]/25 shadow-[0_0_40px_rgba(255,180,0,0.12)] animate-float"
            />
          </motion.div>

          {/* Feature chips — overlaid, no layout height */}
          <div className="absolute left-0 xl:-left-2 top-1/2 -translate-y-1/2 flex flex-col gap-2.5 z-20 w-[min(100%,240px)] [@media(max-height:720px)]:hidden">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  custom={i}
                  variants={floatingCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    scale: 1.02,
                    borderColor: "rgba(255,180,0,0.3)",
                  }}
                  className="flex items-center gap-3 p-3 bg-black/55 backdrop-blur-md border border-white/10 rounded-xl shadow-xl"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#FFB400]/10 border border-[#FFB400]/20 flex items-center justify-center text-[#FFB400] shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white truncate">
                      {feature.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight line-clamp-1">
                      {feature.desc}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact bottom strip — stats + trust in one viewport band */}
      <footer className="relative z-20 shrink-0 w-full max-w-7xl mx-auto px-5 sm:px-6 pb-3 sm:pb-4 pt-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.55 }}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#050505]/80"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center text-[#FFB400] shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none">
                      {stat.value}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5 truncate">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 sm:px-4 py-2 border-t border-[#FFB400]/15 bg-[#FFB400]/[0.04]">
            <div className="flex items-center gap-1.5 text-[#FFB400] font-bold text-[11px] sm:text-xs">
              <ShieldCheck size={13} />
              <span>Secure. Reliable. Scalable.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] sm:text-[11px] text-neutral-400">
              <span>Bank-grade security</span>
              <span className="text-[#FFB400]/35 hidden sm:inline">•</span>
              <span>Real-time updates</span>
              <span className="text-[#FFB400]/35 hidden sm:inline">•</span>
              <span>Powerful B2B tools</span>
            </div>
          </div>
        </motion.div>
      </footer>
    </section>
  );
}
