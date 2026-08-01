"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Shield,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { devopsApi } from "./api";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const NAV = [
  { href: ROUTES.devops.executive, label: "Executive", icon: LayoutDashboard },
  { href: ROUTES.devops.health, label: "Health", icon: HeartPulse },
  { href: ROUTES.devops.api, label: "API Monitor", icon: Activity },
  { href: ROUTES.devops.errors, label: "Errors", icon: AlertTriangle },
  { href: ROUTES.devops.logs, label: "Logs", icon: ScrollText },
];

export function DevopsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    try {
      await devopsApi.logout();
    } catch {
      /* ignore */
    }
    router.replace(ROUTES.devops.login);
  }

  return (
    <div className="min-h-screen bg-[#07080c] text-zinc-100 flex">
      <aside className="w-60 border-r border-zinc-800/80 bg-zinc-950/80 flex flex-col">
        <div className="px-4 py-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Shield className="text-[#F8B400]" size={18} />
            <div>
              <p className="text-xs font-black tracking-widest text-[#F8B400]">
                DEVOPS
              </p>
              <p className="text-[10px] text-zinc-500 uppercase">
                Control Center
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => {
            const active =
              item.href === ROUTES.devops.executive
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#F8B400]/15 text-[#F8B400]"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-red-300"
          >
            <LogOut size={16} />
            End DevOps session
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#07080c]/90 backdrop-blur px-6 py-3 flex items-center justify-between">
          <p className="text-xs text-zinc-500">
            Superadmin only · step-up session · not linked from product nav
          </p>
          <span className="text-[10px] uppercase tracking-wider text-emerald-400/80">
            Private plane
          </span>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
