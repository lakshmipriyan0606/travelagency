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

export const BookingListDialog: React.FC<BookingListDialogProps> = ({
  selected, setSelected, visibleErrorLogs, hiddenWhatsAppErrorCount, handleQuickReply, handleWhatsApp
}) => {
  return (
    <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
      <DialogContent className="max-w-2xl bg-white p-0 border-none shadow-2xl rounded-3xl overflow-hidden font-sans">
        {selected && (
          <div className="flex flex-col">
            <div className="bg-gradient-to-br from-primary to-[#F69520] p-8 text-white relative">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest">Booking Request</span>
                  <h2 className="text-3xl font-bold mt-3 tracking-tight">#{selected.bookingId}</h2>
                  <p className="text-white/80 font-medium mt-1 uppercase text-xs tracking-widest">{selected.packageName ? "Package: " + selected.packageName : selected.destination}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[100px]">
                  <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Travel Date</span>
                  <span className="text-lg font-bold">
                    {(() => {
                      if (!selected.travelDate) return selected.travelMonth || "TBD";
                      const d = new Date(selected.travelDate);
                      return isNaN(d.getTime()) ? (selected.travelMonth || "TBD") : d.toLocaleDateString();
                    })()}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-6 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl"><ExternalLink size={20} /></div>
            </div>

            <div className="p-8 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-700 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <section className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Customer Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500"><Users size={18} /></div>
                      <div>
                        <p className="text-sm font-bold text-neutral-800 leading-tight">{selected.name}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{selected.city || "City not provided"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500"><Mail size={18} /></div>
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Email</p>
                        <p className="text-sm font-semibold text-neutral-800">{selected.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500"><Phone size={18} /></div>
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Direct Contact</p>
                        <p className="text-sm font-semibold text-neutral-800">{selected.phone}</p>
                      </div>
                    </div>
                    {selected.message && (
                      <div className="mt-6 pt-6 border-t border-neutral-100">
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none mb-3">Customer Message</p>
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 italic text-sm text-neutral-600 leading-relaxed break-words">"{selected.message}"</div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Trip Preferences</h4>
                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Destination</span>
                      <span className="text-sm font-bold text-neutral-800 text-right">{selected.destination}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Group Size</span>
                      <span className="text-sm font-bold text-neutral-800 text-right">{selected.noOfPeople || 1} Person(s)</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Style</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest">{selected.vacationType || "General"}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleQuickReply(selected.email, selected.name, selected.bookingId)} className="flex-1 py-3 bg-neutral-800 text-white rounded-2xl font-bold text-sm hover:bg-neutral-900 transition-all shadow-lg shadow-neutral-200">Quick Reply</button>
                  <button onClick={() => handleWhatsApp(selected.whatsapp || selected.phone, selected.name)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-neutral-100 hover:bg-emerald-50 text-emerald-500" title="WhatsApp Message"><MessageCircle size={20} /></button>
                </div>
              </section>

              <section className="space-y-6 md:col-span-2 mt-4 pt-6 border-t border-neutral-100">
                <div>
                  <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-3">System Integrations</h4>
                  <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Google Sheet', status: selected.sheetSyncStatus },
                        { label: 'User Email', status: selected.userEmailStatus },
                        { label: 'Admin Email', status: selected.adminEmailStatus }
                      ].map((integration, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-neutral-100 shadow-sm flex justify-between items-center sm:flex-col sm:items-start sm:gap-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{integration.label}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-widest ${
                            integration.status === 'Success' ? 'bg-green-100 text-green-700' :
                            integration.status?.includes('Failed') ? 'bg-red-100 text-red-700' :
                            integration.status?.includes('Disabled') ? 'bg-neutral-200 text-neutral-600' :
                            'bg-orange-100 text-orange-700'
                          }`}>{integration.status || 'Pending'}</span>
                        </div>
                      ))}
                    </div>

                    {visibleErrorLogs.length > 0 && (
                      <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-3">
                        <h5 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1"><Info size={12} /> Error Logs</h5>
                        <div className="space-y-2">
                          {visibleErrorLogs.map((log, idx) => (
                            <div key={idx} className="bg-white/80 p-2.5 rounded-lg border border-red-100/50 text-xs text-red-800 break-words">
                              <span className="font-bold">{log.task}:</span> {normalizeErrorMessage(log.message)}
                            </div>
                          ))}
                        </div>
                        {hiddenWhatsAppErrorCount > 0 && (
                          <p className="text-[11px] text-red-500 font-medium">{hiddenWhatsAppErrorCount} WhatsApp error{hiddenWhatsAppErrorCount > 1 ? "s" : ""} hidden.</p>
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
}

