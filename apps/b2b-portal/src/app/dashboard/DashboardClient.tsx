"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgentProfile } from "@/api/auth.api";
import { 
  Building2, Globe, Mail, User, ShieldCheck, 
  Percent, FileText, LogOut, Loader2, ArrowRight,
  TrendingUp, Award, Calendar, DollarSign
} from "lucide-react";
import { useState } from "react";
import { ROUTES } from "@/lib/routes";

export default function DashboardClient() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading, error } = useQuery({
    queryKey: ["agentProfile"],
    queryFn: getAgentProfile,
  });

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "b2b_portal_access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "b2b_portal_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "agency_status=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    window.location.href = ROUTES.login;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-neutral-400 text-sm mt-4 font-bold tracking-wider uppercase">Loading Partner Portal...</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6">
        <div className="w-16 h-16 bg-red-950/50 border border-red-500/50 rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck className="text-red-500 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black">Session Error</h2>
        <p className="text-neutral-400 mt-2 text-center max-w-md">Could not retrieve your agency profile. Please sign in again.</p>
        <button 
          onClick={handleLogout}
          className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition"
        >
          Back to Login
        </button>
      </div>
    );
  }

  const { user, agency } = data.data || data;

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case 'travel_agency': return 'Travel Agency';
      case 'tour_operator': return 'Tour Operator';
      case 'dmc': return 'DMC';
      case 'freelance_agent': return 'Freelance Agent';
      default: return type;
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-neutral-900 border-r border-neutral-800 text-white justify-between">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Building2 className="text-neutral-950 w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg leading-tight tracking-tight">TravelHero</h2>
              <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Partner Portal</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === "overview"
                  ? "bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <TrendingUp size={16} />
              Overview
            </button>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3 px-3 py-4 bg-neutral-950/40 rounded-2xl border border-neutral-800/50 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <User size={18} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold truncate">{user?.name}</span>
              <span className="text-[10px] text-neutral-400 truncate">{user?.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-950/20 hover:bg-red-900/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 className="text-neutral-950 w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold">Welcome back, {user?.name}</h1>
              <p className="text-xs text-neutral-400 hidden sm:block">Manage your agency partnership and profile details.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-wider text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              {agency?.status}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-auto p-6 md:p-8 space-y-8 bg-neutral-950">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-neutral-700 transition">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition"></div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Commission Rate</p>
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                  <Percent size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-black mt-4">{agency?.commissionRate || 10}%</h3>
              <p className="text-xs text-neutral-500 mt-2">Standard agency booking commission</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-neutral-700 transition">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition"></div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Partnership Tier</p>
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                  <Award size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-black mt-4">Gold Partner</h3>
              <p className="text-xs text-neutral-500 mt-2">Based on your activity level</p>
            </div>

            {/* Stat 3 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-neutral-700 transition">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition"></div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Total Bookings</p>
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                  <Calendar size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-black mt-4">12</h3>
              <p className="text-xs text-neutral-500 mt-2">Bookings processed this month</p>
            </div>

            {/* Stat 4 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group hover:border-neutral-700 transition">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition"></div>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Commission Earned</p>
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                  <DollarSign size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-black mt-4">$4,350.00</h3>
              <p className="text-xs text-neutral-500 mt-2">Total revenue payout generated</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Agency Details */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 xl:col-span-2 space-y-6">
              <div className="border-b border-neutral-800 pb-4">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Building2 size={20} className="text-amber-500" /> Agency Profile Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Company Name</p>
                  <p className="text-sm font-bold mt-1 text-white">{agency?.companyName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Business Type</p>
                  <p className="text-sm font-bold mt-1 text-white">{getBusinessTypeLabel(agency?.businessType)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Registration Number</p>
                  <p className="text-sm font-bold mt-1 text-white">{agency?.registrationNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Country / Region</p>
                  <p className="text-sm font-bold mt-1 text-white">{agency?.country}</p>
                </div>
                {agency?.gstNumber && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">GST / Tax Number</p>
                    <p className="text-sm font-bold mt-1 text-white">{agency?.gstNumber}</p>
                  </div>
                )}
                {agency?.websiteUrl && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Website Address</p>
                    <a 
                      href={agency.websiteUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-sm font-bold mt-1 text-amber-500 hover:underline flex items-center gap-1"
                    >
                      <Globe size={14} /> {agency.websiteUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="border-t border-neutral-800 pt-6">
                <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-2">Office Address</p>
                <div className="bg-neutral-950/50 rounded-2xl p-4 border border-neutral-800/80 text-sm space-y-1 font-medium text-neutral-400">
                  <p>{agency?.officeAddress?.line1}</p>
                  {agency?.officeAddress?.line2 && <p>{agency?.officeAddress?.line2}</p>}
                  <p>{agency?.officeAddress?.city}, {agency?.officeAddress?.state} - {agency?.officeAddress?.postalCode}</p>
                  <p>{agency?.officeAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Owner */}
            <div className="space-y-6">
              {/* Account Owner Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-sm text-neutral-400 uppercase tracking-wider">Account Operator</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-black text-white">{user?.name}</p>
                    <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                      <Mail size={12} /> {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Engine Quick Actions */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                <h3 className="font-bold text-sm text-amber-500 uppercase tracking-wider mb-4">Partner Quick Actions</h3>
                <div className="space-y-3">
                  <div className="w-full p-4 bg-neutral-950/60 border border-neutral-800 rounded-2xl text-left cursor-not-allowed">
                    <p className="text-sm font-bold text-neutral-300">Book Flights & Hotels</p>
                    <p className="text-xs text-neutral-500 mt-1">Direct API search integration (Coming Soon)</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className="w-full p-4 bg-neutral-950/40 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl text-left transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">View Commission Payouts</p>
                      <p className="text-xs text-neutral-500 mt-0.5">Check processed booking ledger</p>
                    </div>
                    <ArrowRight size={16} className="text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
