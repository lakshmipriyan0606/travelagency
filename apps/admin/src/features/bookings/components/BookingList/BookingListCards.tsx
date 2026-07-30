"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Users,
  Search,
  AlertTriangle,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Booking } from "../../api/bookings.api";
import { bookingHasIntegrationFailures } from "./useBookingList";

interface BookingListCardsProps {
  filteredBookings: Booking[] | undefined;
  setSelected: (booking: Booking | null) => void;
  handleWhatsApp: (phone: string, name: string) => void;
}

const contactBtnClass =
  "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50 transition-all duration-150 hover:scale-[1.04] active:scale-[0.98]";

export function BookingListCards({
  filteredBookings,
  setSelected,
  handleWhatsApp,
}: BookingListCardsProps) {
  if (!filteredBookings || filteredBookings.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10 bg-white/[0.02]">
          <Search className="text-white/25" size={22} />
        </div>
        <h3 className="text-base font-semibold text-white/80">No bookings found</h3>
        <p className="text-white/45 text-sm max-w-xs mx-auto mt-1.5">
          We couldn&apos;t find any inquiries matching your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      <AnimatePresence mode="popLayout">
        {filteredBookings.map((b) => (
          <motion.article
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key={b._id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/50 shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-[#F8B400]/35 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,0,0,0.55)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent"
          >
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white tracking-tight">
                      #{b.bookingId}
                    </span>
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
                  <p className="text-xs text-white/45 truncate mt-1">
                    {b.packageName ? `Package: ${b.packageName}` : b.destination}
                  </p>
                </div>
                <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F8B400]/12 text-[#F8B400] border border-[#F8B400]/20 shrink-0">
                  {b.vacationType || "General"}
                </span>
              </div>

              <div>
                <p className="text-base font-semibold text-white tracking-tight truncate">{b.name}</p>
                <p className="text-sm text-white/55 flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="shrink-0 text-[#F8B400]/70" />
                  <span className="truncate">{b.city || "Not specified"}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/[0.06] text-white/70 border border-white/[0.08]">
                  <Users size={10} />
                  {b.noOfPeople || 1} people
                </span>
                {b.travelDate && (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/[0.06] text-white/70 border border-white/[0.08] tabular-nums">
                    {new Date(b.travelDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.06]">
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

                <button
                  type="button"
                  onClick={() => setSelected(b)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8B400] hover:bg-[#e0a200] text-black px-3.5 py-2 text-xs font-bold transition-colors shadow-[0_0_16px_rgba(248,180,0,0.2)]"
                >
                  Details
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  );
}
