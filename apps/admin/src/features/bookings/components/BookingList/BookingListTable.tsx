import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Users, ChevronRight, Search, AlertTriangle, MessageCircle } from "lucide-react";
import { Booking } from "../../api/bookings.api";
import { bookingHasIntegrationFailures } from "./useBookingList";

interface BookingListTableProps {
  filteredBookings: Booking[] | undefined;
  setSelected: (booking: Booking | null) => void;
  handleWhatsApp: (phone: string, name: string) => void;
}

const contactBtnClass =
  "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-all duration-150 hover:scale-[1.04] active:scale-[0.98]";

export const BookingListTable: React.FC<BookingListTableProps> = ({ filteredBookings, setSelected, handleWhatsApp }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/40 shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-12 gap-4 px-5 py-3.5 bg-[var(--ent-elevated,#1c1c22)]/70 border-b border-white/[0.06] text-[11px] font-semibold text-white/55 uppercase tracking-wider">
          <div className="col-span-3">Inquiry Details</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-3">Preference</div>
          <div className="col-span-2">Contact</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          <AnimatePresence mode="popLayout">
            {filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings.map((b) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={b._id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center group hover:bg-white/[0.035] transition-colors duration-150"
                >
                  <div className="col-span-3 min-w-0">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white tracking-tight">#{b.bookingId}</span>
                        {bookingHasIntegrationFailures(b) && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8B400]/12 text-[#F8B400] border border-[#F8B400]/25 text-[10px] font-bold uppercase tracking-wide"
                            title="Email or Google Sheet reported a failure — open details for error logs"
                          >
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            Issue
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-white/45 truncate">
                        {b.packageName ? `Package: ${b.packageName}` : b.destination}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 min-w-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-white/90 truncate">{b.name}</span>
                      <span className="text-xs text-white/45 flex items-center gap-1 truncate">
                        <MapPin size={11} className="shrink-0 text-[#F8B400]/70" />
                        {b.city || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F8B400]/12 text-[#F8B400] border border-[#F8B400]/20">
                        {b.vacationType || "General"}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/[0.06] text-white/70 border border-white/[0.08]">
                        <Users size={10} />
                        {b.noOfPeople || 1}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex gap-1.5">
                      <a
                        href={`mailto:${b.email}`}
                        className={`${contactBtnClass} hover:text-[#F8B400] hover:bg-[#F8B400]/10 hover:border-[#F8B400]/25`}
                        title={`Email ${b.name}`}
                        aria-label={`Email ${b.name}`}
                      >
                        <Mail size={15} />
                      </a>
                      <a
                        href={`tel:${b.phone}`}
                        className={`${contactBtnClass} hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/25`}
                        title="Call Customer"
                        aria-label={`Call ${b.name}`}
                      >
                        <Phone size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleWhatsApp(b.whatsapp || b.phone, b.name)}
                        className={`${contactBtnClass} text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/25`}
                        title="WhatsApp Message"
                        aria-label={`WhatsApp ${b.name}`}
                      >
                        <MessageCircle size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(b)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-white/45 border border-transparent hover:text-[#0c0c0f] hover:bg-[#F8B400] hover:border-[#F8B400] hover:shadow-[0_0_16px_rgba(248,180,0,0.25)] transition-all duration-150"
                      title="View details"
                      aria-label={`View booking ${b.bookingId}`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10 bg-white/[0.02]">
                  <Search className="text-white/25" size={22} />
                </div>
                <h3 className="text-base font-semibold text-white/80">No bookings found</h3>
                <p className="text-white/45 text-sm max-w-xs mx-auto mt-1.5">
                  We couldn&apos;t find any inquiries matching your search criteria.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
