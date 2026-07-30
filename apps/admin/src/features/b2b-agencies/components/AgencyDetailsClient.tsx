"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getB2BAgencies,
  getB2BAgencyUsers,
  getB2BAgencyStatusLog,
  B2BAgency,
  B2BAgencyUser,
  StatusLogEntry,
} from "@/api/b2bAdmin.api";
import { useState } from "react";
import {
  Building2,
  Users,
  X,
  Mail,
  Phone,
  Briefcase,
  Globe,
  MapPin,
  FileText,
  Percent,
  Calendar,
  ChevronRight,
  Hash,
  Clock,
  ArrowLeftRight,
  User,
} from "lucide-react";

/* ── Status Badge ─────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    active:    { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
    pending:   { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500" },
    suspended: { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500" },
    rejected:  { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400" },
  };
  const s = map[status] ?? map.rejected;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ── Detail Row helper ────────────────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-800 mt-0.5 break-words">
          {value ?? <span className="text-neutral-400 font-medium">—</span>}
        </p>
      </div>
    </div>
  );
}

/* ── Agency Detail Drawer ─────────────────────────────────────── */
function AgencyDetailDrawer({
  agency,
  onClose,
}: {
  agency: B2BAgency | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"details" | "users" | "log">("details");

  const { data: users = [], isLoading: isUsersLoading } = useQuery<B2BAgencyUser[]>({
    queryKey: ["agencyUsers", agency?._id],
    queryFn: () => getB2BAgencyUsers(agency!._id),
    enabled: !!agency?._id && activeTab === "users",
  });

  const { data: logs = [], isLoading: isLogsLoading } = useQuery<StatusLogEntry[]>({
    queryKey: ["agencyStatusLogs", agency?._id],
    queryFn: () => getB2BAgencyStatusLog(agency!._id),
    enabled: !!agency?._id && activeTab === "log",
  });

  if (!agency) return null;

  const tabs = [
    { key: "details", label: "Details", icon: Building2 },
    { key: "users",   label: "Users",   icon: Users },
    { key: "log",     label: "Activity", icon: Clock },
  ] as const;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-screen w-full max-w-[460px] bg-white shadow-2xl z-50 flex flex-col border-l border-neutral-200 animate-slide-in-right">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-neutral-100 bg-neutral-950">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={agency.status} />
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                {agency.businessType.replace(/_/g, " ")}
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">{agency.companyName}</h2>
            {agency.tradeName && (
              <p className="text-sm text-neutral-400 mt-0.5">Trading as: {agency.tradeName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-neutral-700 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100 px-4 gap-1 pt-2 bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl border-b-2 transition-all duration-150 ${
                  isActive
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── DETAILS TAB ───────────────────────────── */}
          {activeTab === "details" && (
            <div className="p-6 space-y-6">

              {/* Commission highlight */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-amber-50 border border-primary/20">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Percent size={20} className="text-neutral-950" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Commission Rate</p>
                  <p className="text-3xl font-black text-neutral-900">{agency.commissionRate ?? 0}%</p>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Business Info</p>
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 px-4">
                  <DetailRow icon={Hash}     label="Registration No." value={agency.registrationNumber} />
                  <DetailRow icon={Globe}    label="Country"           value={agency.country} />
                  <DetailRow icon={FileText} label="GST Number"        value={agency.gstNumber} />
                  <DetailRow icon={Briefcase} label="Years in Business" value={agency.yearsInBusiness != null ? `${agency.yearsInBusiness} yrs` : null} />
                  <DetailRow icon={Hash}     label="IATA Number"       value={agency.iataNumber} />
                  {agency.websiteUrl ? (
                    <div className="flex items-start gap-3 py-3 border-b border-neutral-100 last:border-0">
                      <div className="w-8 h-8 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Globe size={14} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Website</p>
                        <a
                          href={agency.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-primary hover:underline mt-0.5 flex items-center gap-1"
                        >
                          Visit Site <ChevronRight size={12} />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <DetailRow icon={Globe} label="Website" value={null} />
                  )}
                </div>
              </div>

              {/* Office Address */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Office Address</p>
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 px-4">
                  <DetailRow icon={MapPin} label="Address Line 1" value={agency.officeAddress.line1} />
                  {agency.officeAddress.line2 && (
                    <DetailRow icon={MapPin} label="Address Line 2" value={agency.officeAddress.line2} />
                  )}
                  <DetailRow icon={MapPin} label="City"        value={agency.officeAddress.city} />
                  <DetailRow icon={MapPin} label="State"       value={agency.officeAddress.state} />
                  <DetailRow icon={MapPin} label="Postal Code" value={agency.officeAddress.postalCode} />
                  <DetailRow icon={Globe}  label="Country"     value={agency.officeAddress.country} />
                </div>
              </div>

              {/* Meta */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-2">Timestamps</p>
                <div className="bg-neutral-50 rounded-2xl border border-neutral-100 px-4">
                  <DetailRow icon={Calendar} label="Registered On" value={new Date(agency.createdAt).toLocaleString()} />
                  <DetailRow icon={Clock}    label="Last Updated"  value={new Date(agency.updatedAt).toLocaleString()} />
                </div>
              </div>

              {/* Rejection Reason */}
              {agency.rejectionReason && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-1">Rejection Reason</p>
                  <p className="text-sm font-medium text-red-700">{agency.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {/* ── USERS TAB ─────────────────────────────── */}
          {activeTab === "users" && (
            <div className="p-6">
              {isUsersLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">
                    {users.length} Contact{users.length !== 1 ? "s" : ""} Found
                  </p>
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-start gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <User size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-black text-sm text-neutral-900">{user.name}</p>
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {user.role}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-neutral-500">
                            <Mail size={11} className="text-neutral-400" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Phone size={11} className="text-neutral-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {user.designation && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Briefcase size={11} className="text-neutral-400" />
                              <span>{user.designation}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-neutral-400 pt-0.5">
                            <Calendar size={11} />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                    <Users size={24} className="text-neutral-400" />
                  </div>
                  <p className="font-bold text-neutral-500">No users found</p>
                  <p className="text-xs text-neutral-400 mt-1">User data may not be available via the API</p>
                </div>
              )}
            </div>
          )}

          {/* ── LOG TAB ───────────────────────────────── */}
          {activeTab === "log" && (
            <div className="p-6">
              {isLogsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : logs.length > 0 ? (
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4">Status History</p>
                  <div className="relative border-l-2 border-neutral-200 pl-5 ml-3 space-y-6">
                    {logs.map((log) => (
                      <div key={log._id} className="relative">
                        <div className="absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                          <ArrowLeftRight size={8} className="text-neutral-950" />
                        </div>
                        <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge status={log.previousStatus} />
                            <span className="text-neutral-400 text-sm">→</span>
                            <StatusBadge status={log.newStatus} />
                          </div>
                          <p className="text-xs text-neutral-500">
                            <span className="font-bold text-neutral-700">{log.changedBy?.name ?? "System"}</span>
                            {" · "}{new Date(log.createdAt).toLocaleString()}
                          </p>
                          {log.reason && (
                            <p className="text-xs text-neutral-600 bg-white border border-neutral-100 rounded-xl p-2.5 mt-1">
                              {log.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
                    <Clock size={24} className="text-neutral-400" />
                  </div>
                  <p className="font-bold text-neutral-500">No activity yet</p>
                  <p className="text-xs text-neutral-400 mt-1">Status transitions will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ── Business type label ──────────────────────────────────────── */
function getBusinessTypeLabel(type: string) {
  switch (type) {
    case "travel_agency":   return "Travel Agency";
    case "tour_operator":   return "Tour Operator";
    case "dmc":             return "DMC";
    case "freelance_agent": return "Freelance Agent";
    default:                return type;
  }
}

/* ── Main Page Component ──────────────────────────────────────── */
export default function AgencyDetailsClient() {
  const [selectedAgency, setSelectedAgency] = useState<B2BAgency | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: agencies = [], isLoading } = useQuery<B2BAgency[]>({
    queryKey: ["b2bAgencies"],
    queryFn: getB2BAgencies,
  });

  const filtered = agencies.filter((a) => {
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.companyName.toLowerCase().includes(q) ||
      a.tradeName?.toLowerCase().includes(q) ||
      a.registrationNumber.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <Building2 className="text-primary" /> Agency Details
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Full profile view — click any row to open agency details, contact info &amp; activity log.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, registration, country…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <svg className="absolute left-3 top-3 text-neutral-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Agencies Table / List */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.6fr_40px] gap-4 px-6 py-3 bg-neutral-50 border-b border-neutral-100 text-[10px] font-black uppercase tracking-wider text-neutral-400">
          <span>Agency</span>
          <span>Registration / Type</span>
          <span>Country / GST</span>
          <span>Commission</span>
          <span>Status</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-neutral-400 font-medium">
            No agencies match your search.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filtered.map((agency) => (
              <button
                key={agency._id}
                onClick={() => setSelectedAgency(agency)}
                className="w-full grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.6fr_40px] gap-4 px-6 py-4 text-left hover:bg-primary/5 transition-colors group items-center"
              >
                {/* Agency Name */}
                <div>
                  <p className="font-black text-sm text-neutral-900 group-hover:text-primary transition-colors truncate">
                    {agency.companyName}
                  </p>
                  {agency.tradeName && (
                    <p className="text-xs text-neutral-400 font-medium truncate">
                      DBA: {agency.tradeName}
                    </p>
                  )}
                </div>

                {/* Reg + Type */}
                <div>
                  <p className="text-xs font-bold text-neutral-700">{agency.registrationNumber}</p>
                  <p className="text-[10px] font-semibold text-neutral-400 mt-0.5">
                    {getBusinessTypeLabel(agency.businessType)}
                  </p>
                </div>

                {/* Country / GST */}
                <div>
                  <p className="text-xs font-bold text-neutral-700">{agency.country}</p>
                  {agency.gstNumber && (
                    <p className="text-[10px] font-semibold text-neutral-400 mt-0.5 truncate">
                      GST: {agency.gstNumber}
                    </p>
                  )}
                </div>

                {/* Commission */}
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    <Percent size={10} />
                    {agency.commissionRate ?? 0}%
                  </span>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={agency.status} />
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <ChevronRight
                    size={16}
                    className="text-neutral-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Total count */}
      <p className="text-xs text-neutral-400 font-semibold text-right">
        Showing {filtered.length} of {agencies.length} agencies
      </p>

      {/* Detail Drawer */}
      {selectedAgency && (
        <AgencyDetailDrawer
          agency={selectedAgency}
          onClose={() => setSelectedAgency(null)}
        />
      )}
    </div>
  );
}
