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
  BadgeCheck 
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8 },
  },
};

const floatingCardVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.4 + i * 0.15,
      duration: 0.8,
    },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full bg-[#050505] text-white overflow-hidden flex flex-col justify-between selection:bg-[#FFB400] selection:text-black">
      
      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-30 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFB400] to-[#FFD66B] rounded-xl flex items-center justify-center shadow-lg shadow-[#FFB400]/10">
            <Building2 className="text-[#050505] w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white leading-none">TravelAgency</span>
            <span className="text-[9px] uppercase font-bold text-[#FFB400] tracking-widest mt-1">B2B Portal</span>
          </div>
        </div>

        <Link href={ROUTES.login}>
          <button className="px-5 py-2 bg-white/5 hover:bg-[#FFB400]/12 border border-white/8 hover:border-[#FFB400]/30 text-xs font-semibold uppercase tracking-wider rounded-full transition duration-300">
            Login
          </button>
        </Link>
      </header>

      {/* Main Grid Wrapper */}
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-20 flex-grow py-8 lg:py-16">
        
        {/* Left Content (45%) */}
        <motion.div 
          className="lg:col-span-5 space-y-8 flex flex-col justify-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your Trusted Travel <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB400] to-[#FFD66B]">
                Partnership Starts Here
              </span>
            </h1>
            <p className="text-base md:text-lg text-neutral-400 leading-relaxed max-w-lg font-light">
              Access exclusive wholesale rates, manage bookings, and grow your business with our powerful B2B platform.
            </p>
          </motion.div>

          <motion.div className="flex flex-wrap items-center gap-4" variants={itemVariants}>
            <Link href={ROUTES.login}>
              <button className="bg-gradient-to-r from-[#FFB400] to-[#FFD66B] hover:from-[#FFD66B] hover:to-[#FFB400] text-black font-bold py-3.5 px-7 rounded-full text-sm flex items-center gap-2 transition duration-300 transform hover:scale-102 shadow-lg shadow-[#FFB400]/15">
                <Briefcase size={16} />
                <span>Partner Login</span>
                <ArrowRight size={16} />
              </button>
            </Link>

            <Link href={ROUTES.register}>
              <button className="bg-white/5 hover:bg-white/10 border border-white/8 text-white font-bold py-3.5 px-7 rounded-full text-sm flex items-center gap-2 transition duration-300">
                <UserPlus size={16} />
                <span>Apply for Partnership</span>
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content (55%) */}
        <div className="lg:col-span-7 relative flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
          
          {/* Main Hero Illustration */}
          <motion.div 
            className="w-full h-full max-w-[550px] relative z-10 select-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image 
              src="/images/hero/hero-illustration.jpg" 
              alt="B2B Travel Illustration"
              width={550}
              height={500}
              priority
              className="object-contain rounded-[36px] border border-[#FFB400]/25 shadow-glow drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            />
          </motion.div>

          {/* Floating Feature Cards Beside Illustration */}
          <div className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 w-full max-w-[280px]">
            
            {/* Card 1: Exclusive Rates */}
            <motion.div 
              custom={0}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, borderColor: "rgba(255,180,0,0.3)" }}
              className="flex items-center gap-3.5 p-4 bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-2xl shadow-xl transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFB400]/10 border border-[#FFB400]/20 flex items-center justify-center text-[#FFB400] shrink-0">
                <Percent size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Exclusive Rates</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">Best wholesale rates for your business</span>
              </div>
            </motion.div>

            {/* Card 2: Easy Management */}
            <motion.div 
              custom={1}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, borderColor: "rgba(255,180,0,0.3)" }}
              className="flex items-center gap-3.5 p-4 bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-2xl shadow-xl transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFB400]/10 border border-[#FFB400]/20 flex items-center justify-center text-[#FFB400] shrink-0">
                <Calendar size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Easy Management</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">Streamline bookings and operations</span>
              </div>
            </motion.div>

            {/* Card 3: Dedicated Support */}
            <motion.div 
              custom={2}
              variants={floatingCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.03, borderColor: "rgba(255,180,0,0.3)" }}
              className="flex items-center gap-3.5 p-4 bg-white/[0.03] backdrop-blur-md border border-white/8 rounded-2xl shadow-xl transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFB400]/10 border border-[#FFB400]/20 flex items-center justify-center text-[#FFB400] shrink-0">
                <PhoneCall size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Dedicated Support</span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">We&apos;re here to support your growth</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Footer Area: Stats and Security Banner */}
      <footer className="w-full max-w-7xl mx-auto px-6 pb-8 space-y-6 z-20">
        
        {/* Statistics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/[0.02] border border-white/8 rounded-[24px] p-6 backdrop-blur-sm"
        >
          {/* Stat 1 */}
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-[#FFB400] shrink-0">
              <Users size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-white tracking-tight">12K+</span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5">Active Agencies</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-[#FFB400] shrink-0">
              <Globe size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-white tracking-tight">250+</span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5">Global Destinations</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-[#FFB400] shrink-0">
              <BadgeCheck size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-white tracking-tight">98%</span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5">Partner Satisfaction</span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/8 flex items-center justify-center text-[#FFB400] shrink-0">
              <PhoneCall size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold text-white tracking-tight">24/7</span>
              <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider mt-0.5">Business Support</span>
            </div>
          </div>
        </motion.div>

        {/* Security Banner */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-3 bg-[#FFB400]/5 border border-[#FFB400]/10 rounded-full text-center text-xs"
        >
          <div className="flex items-center gap-2 text-[#FFB400] font-bold">
            <ShieldCheck size={14} />
            <span>Secure. Reliable. Scalable.</span>
          </div>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-neutral-400">
            <span>Bank-grade security</span>
            <span className="text-[#FFB400]/40">•</span>
            <span>Real-time updates</span>
            <span className="text-[#FFB400]/40">•</span>
            <span>Powerful B2B tools</span>
          </div>
        </motion.div>
      </footer>

    </section>
  );
}
