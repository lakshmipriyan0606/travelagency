"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getB2BAgencies, approveB2BAgency, rejectB2BAgency, suspendB2BAgency, reactivateB2BAgency, getB2BAgencyStatusLog, B2BAgency, StatusLogEntry } from "@/api/b2bAdmin.api";
import { useState } from "react";
import { Check, X, ShieldAlert, RotateCcw, Building2, Globe, FileText, Calendar, Plus, MessageSquare } from "lucide-react";
import { showToast } from "@/lib/toast";

export default function B2BAgenciesClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'suspended' | 'rejected'>('pending');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [logAgencyId, setLogAgencyId] = useState<string | null>(null);

  // Queries
  const { data: agencies = [], isLoading } = useQuery<B2BAgency[]>({
    queryKey: ["b2bAgencies"],
    queryFn: getB2BAgencies,
  });

  const { data: statusLogs = [], isLoading: isLogsLoading } = useQuery<StatusLogEntry[]>({
    queryKey: ["b2bAgencyStatusLogs", logAgencyId],
    queryFn: () => (logAgencyId ? getB2BAgencyStatusLog(logAgencyId) : Promise.resolve([])),
    enabled: !!logAgencyId,
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: approveB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency approved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to approve agency." });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency rejected successfully!" });
      setRejectId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to reject agency." });
    }
  });

  const suspendMutation = useMutation({
    mutationFn: suspendB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency suspended successfully!" });
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to suspend agency." });
    }
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateB2BAgency,
    onSuccess: () => {
      showToast({ type: "success", content: "Agency reactivated successfully!" });
      queryClient.invalidateQueries({ queryKey: ["b2bAgencies"] });
    },
    onError: (err: any) => {
      showToast({ type: "error", content: err?.message || "Failed to reactivate agency." });
    }
  });

  const filteredAgencies = agencies.filter((agency) => agency.status === activeTab);

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectId || !rejectReason.trim()) return;
    rejectMutation.mutate({ id: rejectId, reason: rejectReason });
  };

  const getBusinessTypeLabel = (type: string) => {
    switch (type) {
      case 'travel_agency': return 'Travel Agency';
      case 'tour_operator': return 'Tour Operator';
      case 'dmc': return 'DMC';
      case 'freelance_agent': return 'Freelance Agent';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="text-primary" /> B2B Travel Agencies
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Manage partnership applications, approvals, and status transitions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 gap-1 bg-white p-1 rounded-2xl border">
        {(['pending', 'active', 'suspended', 'rejected'] as const).map((tab) => {
          const count = agencies.filter((a) => a.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === tab
                  ? "bg-primary text-neutral-950 shadow-lg shadow-primary/25"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}
            >
              {tab}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Agency Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredAgencies.length > 0 ? (
          filteredAgencies.map((agency) => (
            <div key={agency._id} className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                      {getBusinessTypeLabel(agency.businessType)}
                    </span>
                    <h3 className="text-xl font-black text-neutral-900 mt-2">{agency.companyName}</h3>
                    {agency.tradeName && <p className="text-sm text-neutral-500 font-medium">Trading as: {agency.tradeName}</p>}
                  </div>
                  <button
                    onClick={() => setLogAgencyId(agency._id)}
                    className="h-9 px-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-700 transition flex items-center gap-1.5"
                  >
                    <FileText size={14} /> Log
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-neutral-100 pt-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Reg Number</p>
                    <p className="text-sm font-bold text-neutral-700 mt-0.5">{agency.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Country / GST</p>
                    <p className="text-sm font-bold text-neutral-700 mt-0.5">{agency.country} {agency.gstNumber ? `· GST: ${agency.gstNumber}` : ''}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Address</p>
                    <p className="text-xs font-medium text-neutral-500 mt-0.5 truncate" title={`${agency.officeAddress.line1}, ${agency.officeAddress.city}`}>
                      {agency.officeAddress.line1}, {agency.officeAddress.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Website</p>
                    {agency.websiteUrl ? (
                      <a href={agency.websiteUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 mt-0.5">
                        <Globe size={14} /> Visit Site
                      </a>
                    ) : (
                      <p className="text-sm font-bold text-neutral-400 mt-0.5">None</p>
                    )}
                  </div>
                </div>

                {agency.rejectionReason && agency.status === 'rejected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-700">
                    <p className="font-black uppercase tracking-wider">Rejection Reason</p>
                    <p className="mt-1 font-medium">{agency.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 border-t border-neutral-100 pt-4 flex gap-3">
                {agency.status === 'pending' && (
                  <>
                    <button
                      onClick={() => approveMutation.mutate(agency._id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 h-11 rounded-2xl bg-primary hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-primary/20"
                    >
                      <Check size={16} /> Approve
                    </button>
                    <button
                      onClick={() => setRejectId(agency._id)}
                      className="flex-1 h-11 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
                    >
                      <X size={16} /> Reject
                    </button>
                  </>
                )}

                {agency.status === 'active' && (
                  <button
                    onClick={() => suspendMutation.mutate(agency._id)}
                    disabled={suspendMutation.isPending}
                    className="w-full h-11 rounded-2xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2"
                  >
                    <ShieldAlert size={16} /> Suspend Account
                  </button>
                )}

                {(agency.status === 'suspended' || agency.status === 'rejected') && (
                  <button
                    onClick={() => reactivateMutation.mutate(agency._id)}
                    disabled={reactivateMutation.isPending}
                    className="w-full h-11 rounded-2xl bg-primary hover:bg-amber-400 text-neutral-950 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-primary/10 hover:shadow-primary/20"
                  >
                    <RotateCcw size={16} /> Reactivate / Re-review
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-20 text-center text-neutral-400 font-medium bg-white rounded-3xl border border-dashed border-neutral-200">
            No agencies found with status: <span className="font-bold text-neutral-600 capitalize">{activeTab}</span>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRejectSubmit} className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 p-6 space-y-4">
            <div>
              <h3 className="text-xl font-black text-neutral-900">Reject Agency Application</h3>
              <p className="text-sm text-neutral-500 mt-1">Please provide a constructive reason for rejection. This will be shown to the travel agency.</p>
            </div>
            <textarea
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Invalid or unreadable business registration documentation."
              className="w-full p-4 rounded-2xl border border-neutral-200 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition resize-none text-sm text-neutral-800 font-medium"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={rejectMutation.isPending}
                className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition"
              >
                Submit Rejection
              </button>
              <button
                type="button"
                onClick={() => setRejectId(null)}
                className="flex-1 h-12 rounded-2xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-black uppercase tracking-wider transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Status Log Modal */}
      {logAgencyId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-neutral-900">Agency Status History</h3>
                <p className="text-sm text-neutral-500 mt-0.5">Audit log of all status transitions.</p>
              </div>
              <button
                onClick={() => setLogAgencyId(null)}
                className="w-10 h-10 rounded-2xl border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {isLogsLoading ? (
                <div className="text-center py-10 text-neutral-400 font-medium">Loading status logs...</div>
              ) : statusLogs.length > 0 ? (
                <div className="relative border-l border-neutral-200 pl-4 ml-2 space-y-6">
                  {statusLogs.map((log) => (
                    <div key={log._id} className="relative">
                      <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white"></div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-500 capitalize">{log.previousStatus}</span>
                          <span className="text-neutral-300">➔</span>
                          <span className="text-xs font-black text-primary capitalize">{log.newStatus}</span>
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">
                          {new Date(log.createdAt).toLocaleString()} by {log.changedBy?.name || 'System'}
                        </p>
                        {log.reason && (
                          <p className="text-sm font-medium text-neutral-700 bg-neutral-50 border border-neutral-100 rounded-xl p-3 mt-2">
                            Reason: {log.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-neutral-400 font-medium">No status transitions recorded for this agency.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
