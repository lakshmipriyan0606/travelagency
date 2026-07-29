"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, FileText, HelpCircle } from "lucide-react";
import { Button } from "@travelagency/ui";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 md:p-12 text-text-primary">
      <div className="w-full max-w-5xl glass-panel shadow-premium-lg border border-premium rounded-[32px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[550px]">
        
        {/* Left Side: Information and Navigation options */}
        <div className="md:col-span-6 p-8 md:p-12 flex flex-col justify-between space-y-8">
          <div>
            {/* TravelHero brand header */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-black text-neutral-950">TH</span>
              </div>
              <span className="text-xs font-bold text-text-primary uppercase tracking-wider">TravelHero B2B</span>
            </div>

            <div className="space-y-4">
              <span className="text-7xl font-black tracking-tighter text-primary-accent opacity-90 block">404</span>
              <h1 className="text-3xl font-black tracking-tight text-text-primary leading-tight">Page Not Found</h1>
              <p className="text-sm text-text-secondary leading-relaxed max-w-md">
                {"Oops! The page you're looking for doesn't exist or has been relocated in the portal directory structure."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Quick Navigation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href={ROUTES.dashboard}>
                <div className="flex items-center gap-3 p-3.5 bg-white border border-neutral-100 hover:border-primary-accent/30 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition group">
                  <div className="p-2 rounded-lg bg-amber-50 text-primary-accent group-hover:bg-primary-accent group-hover:text-white transition">
                    <LayoutDashboard size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">Dashboard</span>
                    <span className="text-[9px] text-text-muted">Return to operational hub</span>
                  </div>
                </div>
              </Link>

              <Link href={ROUTES.quotes}>
                <div className="flex items-center gap-3 p-3.5 bg-white border border-neutral-100 hover:border-primary-accent/30 rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition group">
                  <div className="p-2 rounded-lg bg-amber-50 text-primary-accent group-hover:bg-primary-accent group-hover:text-white transition">
                    <FileText size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-text-primary">Quote Requests</span>
                    <span className="text-[9px] text-text-muted">Manage pipeline requests</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-divider">
              <Link href={ROUTES.dashboard}>
                <Button className="bg-neutral-100 hover:bg-neutral-200 text-text-primary font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition text-xs">
                  <ArrowLeft size={14} /> Back to Dashboard
                </Button>
              </Link>

              <div className="flex items-center gap-1.5 text-text-secondary hover:text-text-primary cursor-pointer transition">
                <HelpCircle size={14} />
                <span className="text-xs font-bold">Contact Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Beautiful Travel-related SVG Illustration Panel */}
        <div className="md:col-span-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50 p-12 flex items-center justify-center border-t md:border-t-0 md:border-l border-premium relative overflow-hidden">
          
          {/* Animated Sky Elements Background */}
          <div className="absolute top-10 left-10 w-24 h-6 bg-white/80 rounded-full blur-[2px] opacity-70 animate-pulse" />
          <div className="absolute top-24 right-16 w-32 h-8 bg-white/80 rounded-full blur-[2px] opacity-70 animate-pulse" style={{ animationDelay: "1s" }} />

          {/* Premium Vector SVG Composition */}
          <svg className="w-full max-w-[340px] h-auto drop-shadow-xl" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Terminal Window Grid */}
            <rect x="30" y="30" width="340" height="340" rx="36" fill="white" stroke="#e2e8f0" strokeWidth="2" />
            <path d="M30 180H370" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Clouds in sky */}
            <path d="M120 120C120 109 129 100 140 100C148.5 100 155.8 105.4 158.8 113.2C160.9 111.2 163.7 110 166.8 110C173.5 110 179 115.5 179 122.2C179 123.5 178.8 124.7 178.4 125.8C182.2 127 185 130.6 185 134.8C185 140.4 180.4 145 174.8 145H125.2C119.6 145 115 140.4 115 134.8C115 129.5 119.1 125.1 124.4 124.7C121.7 124.2 120 122.1 120 120Z" fill="#f8fafc" />
            <path d="M250 80C250 71.7 256.7 65 265 65C271.4 65 276.9 69.1 279.1 75C280.7 73.4 282.8 72.5 285.2 72.5C290.2 72.5 294.3 76.6 294.3 81.7C294.3 82.7 294.1 83.6 293.8 84.4C296.6 85.3 298.7 88 298.7 91.2C298.7 95.4 295.3 98.8 291.1 98.8H253.9C249.7 98.8 246.3 95.4 246.3 91.2C246.3 87.2 249.4 83.9 253.4 83.6C251.3 83.2 250 81.6 250 80Z" fill="#f8fafc" />

            {/* Dotted Airplane loop path */}
            <path d="M80 320 C 80 180, 240 220, 280 100" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 6" />

            {/* Ascending Paper Airplane */}
            <g transform="translate(280, 100) rotate(-25)">
              <path d="M0 0 L-20 -5 L-25 -25 L10 -10 Z" fill="#f59e0b" />
              <path d="M0 0 L-20 -5 L10 -10 Z" fill="#d97706" />
              <path d="M0 0 L-25 -25 L10 -10 Z" fill="#f59e0b" opacity="0.8" />
            </g>

            {/* Sun */}
            <circle cx="90" cy="90" r="24" fill="#fef08a" opacity="0.6" />
            <circle cx="90" cy="90" r="16" fill="#fde047" />

            {/* Modern Airport Floor Shadow */}
            <ellipse cx="200" cy="320" rx="90" ry="12" fill="#cbd5e1" opacity="0.4" />

            {/* Yellow Suitcase (Main Element) */}
            <g transform="translate(145, 170)">
              {/* Suitcase Handle bar */}
              <rect x="42" y="5" width="26" height="30" rx="4" fill="none" stroke="#64748b" strokeWidth="4" />
              {/* Suitcase Handle grip */}
              <rect x="36" y="0" width="38" height="8" rx="3" fill="#334155" />
              
              {/* Main Body */}
              <rect x="15" y="30" width="80" height="110" rx="16" fill="#f59e0b" />
              {/* Left Stripe */}
              <rect x="30" y="30" width="10" height="110" fill="#d97706" opacity="0.4" />
              {/* Right Stripe */}
              <rect x="70" y="30" width="10" height="110" fill="#d97706" opacity="0.4" />
              
              {/* Corners protectors */}
              <rect x="15" y="30" width="18" height="18" rx="8" fill="#d97706" />
              <rect x="77" y="30" width="18" height="18" rx="8" fill="#d97706" />
              <rect x="15" y="122" width="18" height="18" rx="8" fill="#d97706" />
              <rect x="77" y="122" width="18" height="18" rx="8" fill="#d97706" />

              {/* Side handle */}
              <rect x="10" y="70" width="5" height="30" rx="2" fill="#334155" />

              {/* Wheels */}
              <circle cx="32" cy="144" r="8" fill="#334155" />
              <circle cx="32" cy="144" r="4" fill="#94a3b8" />
              <circle cx="78" cy="144" r="8" fill="#334155" />
              <circle cx="78" cy="144" r="4" fill="#94a3b8" />

              {/* Luggage Tag hanging off */}
              <rect x="68" y="55" width="12" height="20" rx="2" fill="white" stroke="#cbd5e1" strokeWidth="1" transform="rotate(15)" />
              <line x1="72" y1="52" x2="74" y2="56" stroke="#94a3b8" strokeWidth="1" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
