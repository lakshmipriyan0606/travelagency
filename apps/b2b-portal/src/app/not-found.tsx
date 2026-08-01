"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  PlusCircle,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

const QUICK_NAV = [
  {
    href: ROUTES.dashboard,
    label: "Dashboard",
    hint: "Operational hub",
    icon: LayoutDashboard,
  },
  {
    href: ROUTES.quotes,
    label: "Quotes",
    hint: "Quote request pipeline",
    icon: FileText,
  },
  {
    href: ROUTES.customPackage,
    label: "Create Package",
    hint: "Compose a custom trip",
    icon: PlusCircle,
  },
  {
    href: ROUTES.proposals,
    label: "My Proposals",
    hint: "Saved custom packages",
    icon: ClipboardList,
  },
] as const;

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-5 sm:p-8 md:p-12 overflow-hidden bg-[#0b0e14] text-white">
      {/* Ambient gold atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 15% -5%, rgba(248,180,0,0.12), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 10%, rgba(255,213,74,0.06), transparent 50%), radial-gradient(ellipse 40% 30% at 70% 100%, rgba(248,180,0,0.04), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 login-grid-bg"
      />

      <div className="relative w-full max-w-5xl rounded-[28px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[520px] border border-white/[0.1] bg-[#121218]/90 shadow-[0_24px_80px_rgba(0,0,0,0.55),0_0_0_1px_rgba(248,180,0,0.08)] backdrop-blur-sm">
        {/* Gold edge highlight */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F8B400]/55 to-transparent"
        />

        {/* Left: message + navigation */}
        <div className="md:col-span-6 p-8 md:p-11 flex flex-col justify-between gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-9">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#F8B400] to-[#E8A800] flex items-center justify-center shadow-[0_0_20px_rgba(248,180,0,0.35)]">
                <span className="text-[10px] font-black text-[#0a0a0c]">TH</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-300">
                TravelHero{" "}
                <span className="text-[#F8B400]">B2B</span>
              </span>
            </div>

            <div className="space-y-3">
              <span className="block text-7xl sm:text-8xl font-black tracking-tighter leading-none bg-gradient-to-br from-[#FFD54A] to-[#F8B400] bg-clip-text text-transparent">
                404
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Page Not Found
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                This route is missing or has moved. Use quick navigation below to
                get back into the portal.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8B400]/90">
              Quick Navigation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_NAV.map(({ href, label, hint, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 p-3.5 rounded-2xl border border-white/[0.1] bg-[#1a1a20]/80 hover:border-[#F8B400]/40 hover:bg-[#1c1c24] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8B400]/50"
                >
                  <div className="shrink-0 p-2 rounded-xl bg-[#F8B400]/12 text-[#FFD54A] ring-1 ring-[#F8B400]/25 group-hover:bg-[#F8B400] group-hover:text-[#0a0a0c] group-hover:ring-[#F8B400] transition-colors">
                    <Icon size={16} aria-hidden />
                  </div>
                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-white truncate">
                      {label}
                    </span>
                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 truncate">
                      {hint}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/[0.08]">
              <Link
                href={ROUTES.dashboard}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#F8B400]/35 px-4 py-2.5 text-xs font-bold text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F8B400]/50"
              >
                <ArrowLeft size={14} aria-hidden />
                Back to Dashboard
              </Link>

              <a
                href="mailto:support@travelhero.com"
                className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#FFD54A] transition-colors text-xs font-semibold"
              >
                <HelpCircle size={14} aria-hidden />
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Right: illustration panel */}
        <div className="md:col-span-6 relative flex items-center justify-center p-10 md:p-12 border-t md:border-t-0 md:border-l border-white/[0.08] bg-gradient-to-br from-[#16161c] via-[#121218] to-[#0e0e14] overflow-hidden">
          <div
            aria-hidden
            className="absolute top-1/4 left-1/4 size-40 rounded-full bg-[#F8B400]/10 blur-3xl animate-gold-glow"
          />
          <div
            aria-hidden
            className="absolute bottom-1/4 right-1/5 size-32 rounded-full bg-[#FFD54A]/08 blur-3xl animate-gold-glow"
            style={{ animationDelay: "1.5s" }}
          />

          <svg
            className="relative w-full max-w-[300px] h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)] animate-float"
            viewBox="0 0 400 400"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <rect
              x="30"
              y="30"
              width="340"
              height="340"
              rx="36"
              fill="#1a1a22"
              stroke="rgba(248,180,0,0.22)"
              strokeWidth="2"
            />
            <path
              d="M30 180H370"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            <path
              d="M120 120C120 109 129 100 140 100C148.5 100 155.8 105.4 158.8 113.2C160.9 111.2 163.7 110 166.8 110C173.5 110 179 115.5 179 122.2C179 123.5 178.8 124.7 178.4 125.8C182.2 127 185 130.6 185 134.8C185 140.4 180.4 145 174.8 145H125.2C119.6 145 115 140.4 115 134.8C115 129.5 119.1 125.1 124.4 124.7C121.7 124.2 120 122.1 120 120Z"
              fill="rgba(255,255,255,0.06)"
            />
            <path
              d="M250 80C250 71.7 256.7 65 265 65C271.4 65 276.9 69.1 279.1 75C280.7 73.4 282.8 72.5 285.2 72.5C290.2 72.5 294.3 76.6 294.3 81.7C294.3 82.7 294.1 83.6 293.8 84.4C296.6 85.3 298.7 88 298.7 91.2C298.7 95.4 295.3 98.8 291.1 98.8H253.9C249.7 98.8 246.3 95.4 246.3 91.2C246.3 87.2 249.4 83.9 253.4 83.6C251.3 83.2 250 81.6 250 80Z"
              fill="rgba(255,255,255,0.05)"
            />

            <path
              d="M80 320 C 80 180, 240 220, 280 100"
              stroke="rgba(248,180,0,0.35)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />

            <g transform="translate(280, 100) rotate(-25)">
              <path d="M0 0 L-20 -5 L-25 -25 L10 -10 Z" fill="#F8B400" />
              <path d="M0 0 L-20 -5 L10 -10 Z" fill="#E8A800" />
              <path d="M0 0 L-25 -25 L10 -10 Z" fill="#FFD54A" opacity="0.85" />
            </g>

            <circle cx="90" cy="90" r="24" fill="#F8B400" opacity="0.25" />
            <circle cx="90" cy="90" r="16" fill="#FFD54A" opacity="0.9" />

            <ellipse cx="200" cy="320" rx="90" ry="12" fill="#000" opacity="0.35" />

            <g transform="translate(145, 170)">
              <rect
                x="42"
                y="5"
                width="26"
                height="30"
                rx="4"
                fill="none"
                stroke="#71717a"
                strokeWidth="4"
              />
              <rect x="36" y="0" width="38" height="8" rx="3" fill="#3f3f46" />
              <rect x="15" y="30" width="80" height="110" rx="16" fill="#F8B400" />
              <rect x="30" y="30" width="10" height="110" fill="#E8A800" opacity="0.45" />
              <rect x="70" y="30" width="10" height="110" fill="#E8A800" opacity="0.45" />
              <rect x="15" y="30" width="18" height="18" rx="8" fill="#E8A800" />
              <rect x="77" y="30" width="18" height="18" rx="8" fill="#E8A800" />
              <rect x="15" y="122" width="18" height="18" rx="8" fill="#E8A800" />
              <rect x="77" y="122" width="18" height="18" rx="8" fill="#E8A800" />
              <rect x="10" y="70" width="5" height="30" rx="2" fill="#3f3f46" />
              <circle cx="32" cy="144" r="8" fill="#27272a" />
              <circle cx="32" cy="144" r="4" fill="#71717a" />
              <circle cx="78" cy="144" r="8" fill="#27272a" />
              <circle cx="78" cy="144" r="4" fill="#71717a" />
              <rect
                x="68"
                y="55"
                width="12"
                height="20"
                rx="2"
                fill="#1a1a22"
                stroke="rgba(255,213,74,0.4)"
                strokeWidth="1"
                transform="rotate(15)"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
