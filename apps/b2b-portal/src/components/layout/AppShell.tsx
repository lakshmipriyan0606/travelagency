/**
 * B2B Portal — Premium AppShell component.
 *
 * Wraps responsive sidebar navigation and layout shell structures cleanly.
 */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, Bell, ChevronRight, Building2, LogOut } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
  user?: { name: string; email: string };
  agencyStatus?: string;
  onLogout?: () => void;
}

export default function AppShell({
  children,
  user = { name: "Agent Partner", email: "partner@travelagency.com" },
  agencyStatus = "active",
  onLogout,
}: AppShellProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if (onLogout) return onLogout();
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  const getBreadcrumbs = () => {
    const crumbs: Array<{ label: string; href: string }> = [{ label: "Dashboard", href: ROUTES.dashboard }];
    if (pathname === ROUTES.quotes) crumbs.push({ label: "Quotes", href: ROUTES.quotes });
    if (pathname === ROUTES.quoteNew) {
      crumbs.push({ label: "Quotes", href: ROUTES.quotes });
      crumbs.push({ label: "New Request", href: ROUTES.quoteNew });
    }
    return crumbs;
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans p-4 gap-4">
      
      {/* Desktop Sidebar (Floating Glass Panel) */}
      <aside className={`hidden lg:flex flex-col glass-panel shadow-premium border border-premium rounded-[24px] transition-all duration-300 ease-in-out z-25 ${isCollapsed ? "w-20" : "w-64"}`}>
        <div className="flex-grow overflow-y-auto">
          <Sidebar 
            collapsed={isCollapsed} 
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
          />
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
      <aside className={`fixed top-4 bottom-4 left-4 w-64 glass-panel shadow-premium border border-premium rounded-[24px] z-50 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex-1 overflow-y-auto relative">
          <button onClick={() => setIsMobileOpen(false)} className="absolute right-4 top-4 p-1.5 hover:bg-neutral-100 rounded-lg text-text-secondary">
            <X size={18} />
          </button>
          <Sidebar collapsed={false} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden gap-4">
        
        {/* Topbar Header (Floating Glass Capsule) */}
        <header className="h-14 glass-panel shadow-premium border border-premium rounded-[18px] flex items-center justify-between px-6 z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileOpen(true)} className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg text-text-secondary hover:text-text-primary transition" aria-label="Open menu">
              <Menu size={20} />
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-text-secondary" aria-label="Breadcrumb">
              <Building2 size={14} className="text-text-muted" />
              <ChevronRight size={12} className="text-text-muted" />
              {getBreadcrumbs().map((crumb, idx, arr) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight size={12} className="text-text-muted" />}
                  {idx === arr.length - 1 ? (
                    <span className="text-text-primary font-bold">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-text-primary transition-colors">{crumb.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Agency details + signout on the right side */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex px-3 py-1 bg-success-bg border border-success-border rounded-full text-[10px] font-black uppercase tracking-wider text-success items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              {agencyStatus}
            </span>
            <button className="relative p-2 hover:bg-neutral-100 rounded-lg text-text-secondary hover:text-text-primary transition" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-accent border border-white"></span>
            </button>
            
            <Link href={ROUTES.profile} className="flex items-center gap-3 pl-3 border-l border-divider group hover:opacity-90 transition duration-150">
              <div className="flex flex-col text-right hidden md:flex">
                <span className="text-xs font-bold text-text-primary leading-none group-hover:text-primary-accent transition-colors">{user.name}</span>
                <span className="text-[9px] text-text-secondary mt-1">{user.email || "partner@travelagency.com"}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-center text-text-secondary shrink-0 group-hover:border-primary-accent/40 group-hover:bg-primary-accent-light/10 transition-colors">
                <User size={14} className="group-hover:text-primary-accent transition-colors" />
              </div>
            </Link>
            <button 
                onClick={handleLogout} 
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-white bg-red-50 hover:bg-red-500 border border-red-100 hover:border-red-500 px-3 py-1.5 rounded-lg transition-all duration-150 shadow-sm"
              >
                <LogOut size={12} />
                <span>Sign Out</span>
              </button>
            </div>
        </header>

        {/* Content Body (Layered Workspace Container) */}
        <main className="flex-1 overflow-y-auto bg-white shadow-premium-lg border border-premium rounded-[24px] p-6 lg:p-8">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
