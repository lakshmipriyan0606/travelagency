"use client";

import React, { useTransition } from "react";
import { useDashboardSummary } from "@/features/dashboard/hooks/useDashboard";
import { 
  FolderOpen, Send, CheckCircle, RotateCcw, 
  BadgeCheck, AlertCircle, TrendingUp,
  PlusCircle, RefreshCw, FileText,
  ChevronRight, Inbox, Calendar, Users, 
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { AppShell } from "@/components/layout";
import { QuoteStatus, BudgetCategory } from "@/features/quote-request/types/quote.types";
import { Button } from "@travelagency/ui";

const BUDGET_THEMES: Record<BudgetCategory, { bg: string; text: string; label: string }> = {
  [BudgetCategory.ECONOMY]: { bg: "bg-slate-50 border-slate-100", text: "text-slate-600", label: "Economy" },
  [BudgetCategory.STANDARD]: { bg: "bg-blue-50 border-blue-100", text: "text-blue-600", label: "Standard" },
  [BudgetCategory.PREMIUM]: { bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600", label: "Premium" },
  [BudgetCategory.LUXURY]: { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", label: "Luxury" },
};

const STATUS_THEMES: Record<QuoteStatus, { bg: string; text: string; dot: string; label: string }> = {
  [QuoteStatus.DRAFT]: { bg: "bg-slate-50 border-slate-200/50", text: "text-slate-600", dot: "bg-slate-400", label: "Draft" },
  [QuoteStatus.SUBMITTED]: { bg: "bg-blue-50/70 border-blue-200/30", text: "text-blue-600", dot: "bg-blue-500", label: "Submitted" },
  [QuoteStatus.UNDER_REVIEW]: { bg: "bg-violet-50/70 border-violet-200/30", text: "text-violet-600", dot: "bg-violet-500", label: "Under Review" },
  [QuoteStatus.VENDOR_SOURCING]: { bg: "bg-sky-50/70 border-sky-200/30", text: "text-sky-600", dot: "bg-sky-500", label: "Sourcing" },
  [QuoteStatus.QUOTATION_PREPARATION]: { bg: "bg-indigo-50/70 border-indigo-200/30", text: "text-indigo-600", dot: "bg-indigo-500", label: "Preparing" },
  [QuoteStatus.QUOTATION_READY]: { bg: "bg-emerald-50 border-emerald-200/50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Ready" },
  [QuoteStatus.REVISION_REQUESTED]: { bg: "bg-amber-50 border-amber-200/50", text: "text-amber-700", dot: "bg-amber-500", label: "Needs Revision" },
  [QuoteStatus.QUOTATION_UPDATED]: { bg: "bg-teal-50 border-teal-200/50", text: "text-teal-700", dot: "bg-teal-500", label: "Updated" },
  [QuoteStatus.ACCEPTED]: { bg: "bg-green-50 border-green-200/50", text: "text-green-700", dot: "bg-green-500", label: "Accepted" },
};

export default function DashboardClient() {
  const [, startTransition] = useTransition();
  const { data, isLoading, error, refetch } = useDashboardSummary();

  const handleRefresh = () => {
    startTransition(async () => {
      await refetch();
    });
  };

  const handleLogout = () => {
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-primary">
        <RefreshCw className="w-8 h-8 text-primary-accent animate-spin" />
        <p className="text-text-muted text-xs mt-4 font-bold tracking-widest uppercase animate-pulse">Loading B2B Portal...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-text-primary">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mb-6 text-rose-500 shadow-sm">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-lg font-black tracking-tight">Failed to sync summary dashboard</h2>
        <p className="text-text-secondary text-xs mt-2 text-center max-w-sm">{"Could not establish socket session with TravelHero operations api."}</p>
        <Button onClick={() => refetch()} className="mt-6 bg-primary-accent hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm">
          Retry Sync
        </Button>
      </div>
    );
  }

  const { agency, kpis, recentQuotes, recentActivity } = data;

  const kpiItems = [
    { 
      label: "Open Requests", 
      value: kpis.openRequests, 
      icon: FolderOpen, 
      color: "text-blue-600 bg-blue-50/50 border-blue-100", 
      trend: "+18.4%", 
      trendDir: "up", 
      trendLabel: "vs last 30 days",
      sparkline: "M0,22 Q12,6 25,19 T50,8 T75,20 T100,5",
      sparkColor: "text-blue-500"
    },
    { 
      label: "Submitted Today", 
      value: kpis.submittedToday, 
      icon: Send, 
      color: "text-violet-600 bg-violet-50/50 border-violet-100", 
      trend: "+33.3%", 
      trendDir: "up", 
      trendLabel: "vs yesterday",
      sparkline: "M0,15 Q25,25 45,8 T80,20 T100,6",
      sparkColor: "text-violet-500"
    },
    { 
      label: "Quotes Ready", 
      value: kpis.quotesReady, 
      icon: BadgeCheck, 
      color: "text-emerald-600 bg-emerald-50/50 border-emerald-100", 
      trend: "+14.3%", 
      trendDir: "up", 
      trendLabel: "vs last 7 days",
      sparkline: "M0,25 Q20,10 40,20 T70,5 T100,10",
      sparkColor: "text-emerald-500"
    },
    { 
      label: "Accepted Quotes", 
      value: kpis.acceptedQuotes, 
      icon: CheckCircle, 
      color: "text-amber-600 bg-amber-50/50 border-amber-100", 
      trend: "+20.0%", 
      trendDir: "up", 
      trendLabel: "vs last 30 days",
      sparkline: "M0,20 Q20,5 45,15 T85,8 T100,20",
      sparkColor: "text-amber-500"
    },
    { 
      label: "Pending Revisions", 
      value: kpis.pendingRevisions, 
      icon: RotateCcw, 
      color: "text-rose-600 bg-rose-50/50 border-rose-100", 
      trend: "-10.0%", 
      trendDir: "down", 
      trendLabel: "vs last 7 days",
      sparkline: "M0,6 Q20,5 45,22 T80,10 T100,25",
      sparkColor: "text-rose-500"
    },
  ];

  return (
    <AppShell user={{ name: agency.contactName, email: "" }} agencyStatus={agency.status} onLogout={handleLogout}>
      <div className="space-y-8 max-w-7xl mx-auto px-4 py-2">
        
        {/* Top Sticky Glass Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              Good morning, {agency.contactName} 👋
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">{"Here's what's happening with your travel business today."}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={handleRefresh} className="bg-white border border-neutral-200 text-text-primary font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-neutral-50 transition shadow-sm hover:shadow-md">
              <RefreshCw size={14} />
              Sync Dashboard
            </Button>
          </div>
        </div>

        {/* Hero Section Banner - Stripe style layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Welcome Feature Card */}
          <div className="lg:col-span-2 relative overflow-hidden bg-white border border-border rounded-[24px] p-8 flex flex-col justify-between min-h-[260px] shadow-sm hover:shadow-md transition-all duration-300">
            {/* Subtle glow accent background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-accent-light rounded-full blur-3xl opacity-40"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary-accent/10 border border-primary-accent/20 text-primary-accent">
                  {agency.partnerTier} Partner
                </span>
                <span className="text-text-muted text-xs">•</span>
                <span className="text-text-secondary text-xs font-semibold">{agency.agencyName}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight max-w-lg">
                Welcome, {agency.contactName}
              </h2>
              <p className="text-sm text-text-secondary max-w-md leading-relaxed">
                Submit, manage and track custom B2B partner itineraries on a fast, collaborative workspace.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-8 relative">
              <Link href={ROUTES.quoteNew}>
                <Button className="bg-primary-accent hover:bg-amber-500 text-white font-black py-3 px-6 rounded-xl flex items-center gap-2 transition shadow-sm hover:-translate-y-0.5">
                  <PlusCircle size={16} />
                  New Quote Request
                </Button>
              </Link>
              <Link href={ROUTES.quotes}>
                <Button className="bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-text-primary font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition shadow-sm hover:-translate-y-0.5">
                  View Quotation Pipeline
                </Button>
              </Link>
            </div>
          </div>

          {/* Agency Status Card */}
          <div className="bg-white border border-border rounded-[24px] p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-text-secondary">Agency Health</span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-600">
                Excellent
              </span>
            </div>
            
            <div className="flex items-center gap-5 py-4">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-neutral-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-emerald-500" strokeDasharray="92, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-black text-text-primary">92%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary">Profile Completed</span>
                <span className="text-[11px] text-text-secondary mt-0.5 leading-tight">Your credentials and verification are active.</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-[10px] font-black uppercase tracking-wider text-text-primary rounded-xl transition duration-200">
              Complete Profile
            </button>
          </div>
        </div>

        {/* Premium KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpiItems.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="bg-white border border-border p-6 pb-16 rounded-[20px] relative overflow-hidden group hover:border-neutral-300 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{kpi.label}</span>
                  <div className={`p-1.5 rounded-lg border ${kpi.color} transition-transform group-hover:scale-110`}>
                    <Icon size={14} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2 mt-4">
                  <h3 className="text-3xl font-black text-text-primary tracking-tight">{kpi.value}</h3>
                  <div className="flex flex-col leading-none">
                    <span className={`text-[10px] font-bold ${kpi.trendDir === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                      {kpi.trend}
                    </span>
                    <span className="text-[8px] text-text-muted mt-0.5">{kpi.trendLabel}</span>
                  </div>
                </div>
                
                {/* Micro chart sparkline at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-10 opacity-70 group-hover:opacity-100 transition-all duration-300">
                  <svg className={`w-full h-full ${kpi.sparkColor}`} viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d={kpi.sparkline} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline & Timeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Custom Quotation Pipeline Feed */}
          <div className="lg:col-span-2 bg-white border border-border rounded-[24px] p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
                  <FileText size={18} className="text-primary-accent" /> Recent Quotation Pipeline
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">{"Track updates, revisions, and status approvals."}</p>
              </div>
              <Link href={ROUTES.quotes} className="text-xs font-bold text-primary-accent hover:underline flex items-center gap-1 transition">
                View All <ChevronRight size={14} />
              </Link>
            </div>

            {recentQuotes.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
                <Inbox size={32} className="text-text-muted mb-3" />
                <h4 className="text-sm font-bold text-text-primary">No active quote requests</h4>
                <p className="text-xs text-text-secondary mt-1 max-w-xs">Create your first custom quotation inquiry to populate your pipeline.</p>
                <Link href={ROUTES.quoteNew} className="mt-4">
                  <Button className="bg-primary-accent text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm shadow-primary-accent/10">Create Quote Request</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentQuotes.map((q) => {
                  const theme = STATUS_THEMES[q.status] || STATUS_THEMES[QuoteStatus.DRAFT];
                  const budget = BUDGET_THEMES[q.budgetCategory];
                  return (
                    <div key={q.id} className="group relative bg-neutral-50/50 hover:bg-neutral-50/90 border border-neutral-100/80 hover:border-neutral-200 rounded-2xl p-5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-primary-accent transition-colors">
                          <FileText size={18} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-text-primary group-hover:text-primary-accent transition-colors">
                              {q.reference}
                            </span>
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-md border ${budget.bg} ${budget.text}`}>
                              {budget.label}
                            </span>
                          </div>
                          
                          {/* Travel Details Line */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                            <span className="font-semibold text-text-primary">{q.destination}</span>
                            <span className="text-neutral-300">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(q.travelStart).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-neutral-300">•</span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {q.adults} Ad {q.children > 0 && `, ${q.children} Ch`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Action dropdown/button */}
                      <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 border-neutral-200/50 pt-3 md:pt-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${theme.bg} ${theme.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`}></span>
                          {theme.label}
                        </span>
                        
                        <Link href={`${ROUTES.quotes}/${q.id}`} className="p-1.5 hover:bg-white border border-transparent hover:border-neutral-200 rounded-lg text-text-secondary hover:text-text-primary transition duration-150">
                          <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operations Timeline Activity Feed */}
          <div className="bg-white border border-border rounded-[24px] p-8 space-y-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
                <TrendingUp size={18} className="text-primary-accent" /> Operations Feed
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">Real-time status updates and communications.</p>
            </div>

            {recentActivity.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[220px] text-text-muted">
                <Inbox size={28} className="mb-2" />
                <p className="text-xs">No recent activity logged.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-neutral-100 pl-5 ml-2.5 space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="relative group">
                    {/* Bullet marker */}
                    <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-neutral-200 group-hover:border-primary-accent transition-colors flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-primary-accent transition-colors"></span>
                    </span>
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black text-text-primary">{activity.title}</h4>
                        <span className="text-[9px] text-text-muted font-semibold shrink-0">
                          {new Date(activity.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary leading-relaxed">{activity.description}</p>
                      {activity.quoteReference && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary-accent/5 border border-primary-accent/10 text-[9px] font-bold text-primary-accent mt-1">
                          <FileText size={10} /> {activity.quoteReference}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
