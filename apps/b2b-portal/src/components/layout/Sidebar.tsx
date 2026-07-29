/**
 * B2B Portal — Reusable Sidebar Navigation Component.
 */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, FileText, CheckSquare, PlusCircle, ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Quote Request Portal", href: ROUTES.quotes, icon: FileText },
  { label: "Accepted Packages", href: "#", icon: CheckSquare, disabled: true, comingSoon: true },
  { label: "Create Custom Package", href: "#", icon: PlusCircle, disabled: true, comingSoon: true },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse?: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="p-5 border-b border-divider/40 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-md">
            <Building2 className="text-neutral-950 w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="font-bold text-sm tracking-tight text-text-primary">TravelHero</h2>
              <span className="text-[10px] uppercase font-bold text-primary-accent tracking-widest">B2B Portal</span>
            </div>
          )}
        </div>

        <nav className="p-4 space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== ROUTES.dashboard && pathname.startsWith(item.href) && item.href !== "#");
            const Icon = item.icon;

            const isItemDisabled = "disabled" in item ? !!(item as { disabled?: boolean }).disabled : false;
            if (isItemDisabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-text-muted/60 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    {!collapsed && <span>{item.label}</span>}
                  </div>
                  {!collapsed && <span className="text-[9px] bg-neutral-100 text-neutral-400 px-1.5 py-0.5 rounded-md">Soon</span>}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 border border-transparent ${
                  isActive ? "bg-primary-accent-light text-primary-accent border-primary-accent/20 shadow-sm" : "text-text-secondary hover:text-text-primary hover:bg-neutral-100"
                }`}
              >
                <Icon size={16} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Trigger Arrow at the Bottom of the Sidebar Panel */}
      {onToggleCollapse && (
        <div className="p-4 border-t border-divider/40 flex justify-end">
          <button onClick={onToggleCollapse} className="p-2 hover:bg-neutral-100 rounded-lg text-text-secondary hover:text-text-primary transition" aria-label="Collapse sidebar">
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`} />
          </button>
        </div>
      )}
    </div>
  );
}
