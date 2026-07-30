import { Dialog, DialogContent } from "@travelagency/ui";
import { ExternalLink, Users, Mail, Phone, Info, MessageCircle } from "lucide-react";
import { Booking } from "../../api/bookings.api";
import { normalizeErrorMessage } from "./useBookingList";

interface BookingListDialogProps {
  selected: Booking | null;
  setSelected: (booking: Booking | null) => void;
  visibleErrorLogs: any[];
  hiddenWhatsAppErrorCount: number;
  handleQuickReply: (email: string, name: string, id: string) => void;
  handleWhatsApp: (phone: string, name: string) => void;
}

function statusBadgeClass(status?: string) {
  if (status === "Success") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
  if (status?.includes("Failed")) return "bg-red-500/15 text-red-300 border-red-500/20";
  if (status?.includes("Disabled")) return "bg-white/[0.06] text-white/55 border-white/[0.08]";
  return "bg-[#F8B400]/12 text-[#F8B400] border-[#F8B400]/20";
}

export const BookingListDialog: React.FC<BookingListDialogProps> = ({
  selected, setSelected, visibleErrorLogs, hiddenWhatsAppErrorCount, handleQuickReply, handleWhatsApp
}) => {
  return (
    <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
      <DialogContent className="max-w-2xl bg-[var(--ent-card,#16161b)] p-0 border border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.55)] rounded-2xl overflow-hidden font-sans text-[var(--ent-text-main,#F4F4F5)]">
        {selected && (
          <div className="flex flex-col">
            <div className="relative bg-[var(--ent-elevated,#1c1c22)] p-7 sm:p-8 border-b border-white/[0.08] overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/45 before:to-transparent">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <span className="inline-flex px-2.5 py-1 rounded-md bg-[#F8B400]/12 text-[#F8B400] border border-[#F8B400]/25 text-[10px] font-bold uppercase tracking-widest">
                    Booking Request
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold mt-3 tracking-tight text-white flex items-center gap-3">
                    <span className="ent-gold-bar h-7 shrink-0" />
                    #{selected.bookingId}
                  </h2>
                  <p className="text-white/55 font-medium mt-1.5 uppercase text-xs tracking-widest truncate">
                    {selected.packageName ? `Package: ${selected.packageName}` : selected.destination}
                  </p>
                </div>
                <div className="shrink-0 bg-white/[0.04] border border-white/[0.1] p-3.5 rounded-xl text-center min-w-[100px]">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-[#F8B400]/80 mb-1">Travel Date</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {(() => {
                      if (!selected.travelDate) return selected.travelMonth || "TBD";
                      const d = new Date(selected.travelDate);
                      return isNaN(d.getTime()) ? (selected.travelMonth || "TBD") : d.toLocaleDateString();
                    })()}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-5 right-8 w-10 h-10 bg-[#F8B400] rounded-full flex items-center justify-center text-[#0c0c0f] shadow-[0_0_20px_rgba(248,180,0,0.35)] border border-[#F8B400]/40">
                <ExternalLink size={16} />
              </div>
            </div>

            <div className="p-7 sm:p-8 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <section className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold text-[#F8B400] uppercase tracking-widest mb-3">Customer Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#F8B400]">
                        <Users size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white leading-tight truncate">{selected.name}</p>
                        <p className="text-xs text-white/45 mt-0.5">{selected.city || "City not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50">
                        <Mail size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Email</p>
                        <p className="text-sm font-semibold text-white/90 truncate">{selected.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50">
                        <Phone size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Direct Contact</p>
                        <p className="text-sm font-semibold text-white/90 tabular-nums">{selected.phone}</p>
                      </div>
                    </div>
                    {selected.message && (
                      <div className="mt-6 pt-6 border-t border-white/[0.08]">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-none mb-3">Customer Message</p>
                        <div className="bg-white/[0.03] p-4 rounded-xl border border-white/[0.08] italic text-sm text-white/70 leading-relaxed break-words">
                          &ldquo;{selected.message}&rdquo;
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold text-[#F8B400] uppercase tracking-widest mb-3">Trip Preferences</h4>
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.08] space-y-3">
                    {[
                      { label: "Destination", value: selected.destination },
                      { label: "Group Size", value: `${selected.noOfPeople || 1} Person(s)` },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--ent-elevated,#1c1c22)]/60 p-3.5 rounded-xl border border-white/[0.06] gap-2"
                      >
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">{row.label}</span>
                        <span className="text-sm font-bold text-white text-right">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--ent-elevated,#1c1c22)]/60 p-3.5 rounded-xl border border-white/[0.06] gap-2">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">Style</span>
                      <span className="px-2.5 py-0.5 bg-[#F8B400]/12 text-[#F8B400] border border-[#F8B400]/20 text-[10px] font-bold rounded-md uppercase tracking-widest">
                        {selected.vacationType || "General"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickReply(selected.email, selected.name, selected.bookingId)}
                    className="flex-1 py-3 rounded-xl font-bold text-sm text-[#0c0c0f] bg-gradient-to-r from-[#FFD54A] via-[#F8B400] to-[#E8A800] hover:brightness-105 shadow-[0_4px_18px_rgba(248,180,0,0.35)] transition-all active:scale-[0.98]"
                  >
                    Quick Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWhatsApp(selected.whatsapp || selected.phone, selected.name)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.1] hover:bg-emerald-500/10 hover:border-emerald-500/25 text-emerald-400 transition-all"
                    title="WhatsApp Message"
                    aria-label="WhatsApp Message"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </section>

              <section className="space-y-6 md:col-span-2 mt-2 pt-6 border-t border-white/[0.08]">
                <div>
                  <h4 className="text-[11px] font-bold text-[#F8B400] uppercase tracking-widest mb-3">System Integrations</h4>
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.08] space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "Google Sheet", status: selected.sheetSyncStatus },
                        { label: "User Email", status: selected.userEmailStatus },
                        { label: "Admin Email", status: selected.adminEmailStatus },
                      ].map((integration) => (
                        <div
                          key={integration.label}
                          className="bg-[var(--ent-elevated,#1c1c22)]/60 p-3.5 rounded-xl border border-white/[0.06] flex justify-between items-center sm:flex-col sm:items-start sm:gap-2"
                        >
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{integration.label}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-widest border ${statusBadgeClass(integration.status)}`}>
                            {integration.status || "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>

                    {visibleErrorLogs.length > 0 && (
                      <div className="mt-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                        <h5 className="text-[10px] font-bold text-red-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Info size={12} /> Error Logs
                        </h5>
                        <div className="space-y-2">
                          {visibleErrorLogs.map((log, idx) => (
                            <div key={idx} className="bg-black/30 p-2.5 rounded-lg border border-red-500/15 text-xs text-red-200/90 break-words">
                              <span className="font-bold text-red-300">{log.task}:</span> {normalizeErrorMessage(log.message)}
                            </div>
                          ))}
                        </div>
                        {hiddenWhatsAppErrorCount > 0 && (
                          <p className="text-[11px] text-red-300/80 font-medium">
                            {hiddenWhatsAppErrorCount} WhatsApp error{hiddenWhatsAppErrorCount > 1 ? "s" : ""} hidden.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
