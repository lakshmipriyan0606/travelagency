"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Clock,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

interface AuthShellProps {
  children: React.ReactNode;
}

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Clock,
    title: "Real-time quotations",
    description: "Instant, accurate wholesale quotes",
  },
  {
    icon: UserRound,
    title: "Dedicated account manager",
    description: "Personalized partner support",
  },
  {
    icon: Calendar,
    title: "Live booking updates",
    description: "Stay informed at every step",
  },
  {
    icon: Shield,
    title: "Secure B2B pricing",
    description: "Protected rates, guaranteed",
  },
];

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

function panelContainerVariants(reduceMotion: boolean | null): Variants {
  if (reduceMotion) {
    return { hidden: {}, visible: { transition: { staggerChildren: 0 } } };
  }
  return {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
  };
}

function panelItemVariants(reduceMotion: boolean | null): Variants {
  if (reduceMotion) {
    return { hidden: { opacity: 1 }, visible: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 26 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.62, ease: EASE_OUT_EXPO },
    },
  };
}

function cardGridVariants(reduceMotion: boolean | null): Variants {
  if (reduceMotion) {
    return { hidden: {}, visible: { transition: { staggerChildren: 0 } } };
  }
  return {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
  };
}

function cardItemVariants(reduceMotion: boolean | null): Variants {
  if (reduceMotion) {
    return { hidden: { opacity: 1 }, visible: { opacity: 1 } };
  }
  return {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: EASE_OUT_EXPO },
    },
  };
}

const fadeUp = (reduceMotion: boolean | null, delay = 0) =>
  reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: EASE_OUT_EXPO },
      };

function AuthFeatureCard({
  feature,
  variants,
  reduceMotion,
}: {
  feature: FeatureItem;
  variants: Variants;
  reduceMotion: boolean | null;
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      variants={variants}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.28, ease: EASE_OUT_EXPO },
            }
      }
      className="group relative"
    >
      <div className="absolute -inset-px rounded-[17px] bg-gradient-to-br from-[#F8B400]/35 via-[#F8B400]/10 to-white/[0.04] opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#171717]/98 via-[#121212]/95 to-[#0a0a0a]/90 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md transition-shadow duration-500 group-hover:shadow-[inset_0_1px_0_rgba(248,180,0,0.1),0_12px_40px_rgba(248,180,0,0.07),0_8px_32px_rgba(0,0,0,0.45)] xl:p-3">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-[#F8B400]/12 blur-2xl opacity-30 transition-opacity duration-500 group-hover:opacity-80"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#F8B400]/[0.08] via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="relative">
          <div className="mb-2 flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F8B400]/18 to-[#F8B400]/5 ring-1 ring-[#F8B400]/30 shadow-[0_0_28px_rgba(248,180,0,0.14),inset_0_1px_0_rgba(255,213,74,0.12)] transition-all duration-400 group-hover:ring-[#FFD54A]/45 group-hover:shadow-[0_0_36px_rgba(248,180,0,0.22)] xl:mb-2.5 xl:size-9">
            <Icon size={15} className="text-[#FFD54A]" aria-hidden />
          </div>
          <p className="text-[12px] font-semibold tracking-[-0.01em] text-white xl:text-[13px]">
            {feature.title}
          </p>
          <p className="mt-0.5 text-[10.5px] leading-snug text-[#94949E] xl:mt-1 xl:text-[11px] xl:leading-relaxed">
            {feature.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function AuthBrandPanel({ reduceMotion }: { reduceMotion: boolean | null }) {
  const container = panelContainerVariants(reduceMotion);
  const item = panelItemVariants(reduceMotion);
  const cards = cardGridVariants(reduceMotion);
  const cardItem = cardItemVariants(reduceMotion);

  return (
    <motion.section
      className="hidden min-h-0 overflow-hidden lg:block lg:space-y-3 xl:space-y-3.5 2xl:space-y-4"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={item} className="flex items-center gap-2.5 xl:gap-3">
        <div className="relative flex size-10 items-center justify-center rounded-2xl border border-white/[0.1] bg-[#121212] shadow-[0_0_40px_rgba(248,180,0,0.1)] xl:size-11">
          <span className="bg-gradient-to-br from-[#FFD54A] to-[#F8B400] bg-clip-text text-base font-black text-transparent xl:text-lg">
            T
          </span>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#F8B400]/25"
          />
        </div>
        <div>
          <p className="text-sm font-bold tracking-[-0.01em] text-white xl:text-base">
            TravelAgency
          </p>
          <p className="text-xs font-medium tracking-wide text-[#71717A] xl:text-sm">
            B2B Portal
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="space-y-2.5 xl:space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F8B400]/25 bg-[#121212]/90 px-2.5 py-0.5 text-[11px] font-medium text-[#C4C4CC] shadow-[0_0_20px_rgba(248,180,0,0.06)] backdrop-blur-sm xl:px-3 xl:py-1 xl:text-xs">
          <Sparkles size={12} className="text-[#F8B400]" aria-hidden />
          <span className="bg-gradient-to-r from-[#FFD54A] to-[#F8B400] bg-clip-text text-transparent">
            Partner workspace
          </span>
        </span>

        <div className="space-y-2 xl:space-y-2.5">
          <h1 className="max-w-[12.5ch] text-[1.65rem] font-black leading-[1.08] tracking-[-0.045em] text-white xl:text-[1.85rem] 2xl:text-[2rem]">
            Your journey{" "}
            <span className="bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#FFE066] bg-clip-text text-transparent">
              starts here.
            </span>
          </h1>
          <div
            aria-hidden
            className="h-[2px] w-14 bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-transparent xl:w-16"
          />
          <p className="max-w-[26rem] text-[13px] leading-snug text-[#94949E] xl:text-sm xl:leading-[1.55]">
            Wholesale pricing, instant quotations, and seamless bookings — one
            refined workspace built for travel professionals.
          </p>
        </div>
      </motion.div>

      <motion.div variants={cards} className="grid grid-cols-2 gap-2 xl:gap-2.5">
        {FEATURES.map((feature) => (
          <AuthFeatureCard
            key={feature.title}
            feature={feature}
            variants={cardItem}
            reduceMotion={reduceMotion}
          />
        ))}
      </motion.div>

    </motion.section>
  );
}

export function AuthShell({ children }: AuthShellProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const mode = pathname?.startsWith(ROUTES.register) ? "register" : "login";

  return (
    <main
      data-portal-auth
      className="relative h-dvh w-full overflow-x-hidden bg-[#0A0A0A] text-white max-lg:min-h-dvh max-lg:overflow-y-auto lg:fixed lg:inset-0 lg:overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.22]"
        style={{
          backgroundImage: "url('/images/auth/golden-portal-hero.png')",
          filter: "saturate(0.85) brightness(0.45)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_40%,rgba(248,180,0,0.14),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/88 to-[#0A0A0A]/75"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(248,180,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(248,180,0,0.04)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_40%_40%,black_10%,transparent_75%)]"
      />

      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-[18%] size-[420px] rounded-full bg-[#F8B400]/[0.07] blur-[100px]"
            animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute bottom-[12%] right-[8%] size-[320px] rounded-full bg-[#FFD54A]/[0.05] blur-[90px]"
            animate={{ x: [0, -22, 0], y: [0, 16, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="relative z-10 mx-auto flex h-full min-h-0 max-w-[1440px] flex-col px-4 py-3 sm:px-8 lg:px-10 lg:py-2 xl:px-12">
        <div className="grid min-h-0 flex-1 items-center gap-4 overflow-hidden lg:grid-cols-[1fr_minmax(320px,400px)] lg:gap-6 xl:gap-8">
          <AuthBrandPanel reduceMotion={reduceMotion} />

          <div className="lg:hidden">
            <motion.div
              {...fadeUp(reduceMotion, 0)}
              className="mb-4 flex items-center gap-3"
            >
              <div className="flex size-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#121212]">
                <span className="bg-gradient-to-br from-[#FFD54A] to-[#F8B400] bg-clip-text font-black text-transparent">
                  T
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">TravelAgency</p>
                <p className="text-xs text-[#71717A]">B2B Portal</p>
              </div>
            </motion.div>
          </div>

          <section className="flex w-full justify-center lg:justify-end">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={
                  reduceMotion ? { opacity: 1 } : { opacity: 0, x: 16, y: 8 }
                }
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.35 }}
                className="w-full max-w-[420px]"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AuthShell;
