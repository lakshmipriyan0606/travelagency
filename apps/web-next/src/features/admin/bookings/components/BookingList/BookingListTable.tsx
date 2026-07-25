import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Users, ChevronRight, Search, AlertTriangle, MessageCircle } from "lucide-react";
import { Booking } from "../../api/bookings.api";
import { bookingHasIntegrationFailures } from "./useBookingList";

interface BookingListTableProps {
  filteredBookings: Booking[] | undefined;
  setSelected: (booking: Booking | null) => void;
  handleWhatsApp: (phone: string, name: string) => void;
}

export const BookingListTable: React.FC<BookingListTableProps> = ({ filteredBookings, setSelected, handleWhatsApp }) => {
  return (
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-50/50 border-b border-neutral-100 text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
        <div className="col-span-3">Inquiry Details</div>
        <div className="col-span-3">Customer</div>
        <div className="col-span-3">Preference</div>
        <div className="col-span-2">Contact</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <div className="divide-y divide-neutral-100">
        <AnimatePresence mode="popLayout">
          {filteredBookings && filteredBookings.length > 0 ? (
            filteredBookings.map((b) => (
              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={b._id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-neutral-50/50 transition-colors group">
                <div className="col-span-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-800">#{b.bookingId}</span>
                      {bookingHasIntegrationFailures(b) && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wide" title="Email or Google Sheet reported a failure — open details for error logs">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          Issue
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-neutral-400 mt-0.5">{b.packageName ? "Package: " + b.packageName : b.destination}</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-neutral-700">{b.name}</span>
                    <span className="text-xs text-neutral-400 flex items-center gap-1"><MapPin size={10} /> {b.city || "Not specified"}</span>
                  </div>
                </div>
                <div className="col-span-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg uppercase tracking-wider">{b.vacationType || "General"}</span>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded-lg flex items-center gap-1"><Users size={10} /> {b.noOfPeople || 1}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex gap-2">
                    <a href={`mailto:${b.email}`} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-primary/20 hover:text-primary transition-all"><Mail size={14} /></a>
                    <a href={`tel:${b.phone}`} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 hover:bg-green-100 hover:text-green-600 transition-all" title="Call Customer"><Phone size={14} /></a>
                    <button onClick={() => handleWhatsApp(b.whatsapp || b.phone, b.name)} className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 hover:scale-110 transition-all border border-neutral-100" title="WhatsApp Message"><MessageCircle size={16} /></button>
                  </div>
                </div>
                <div className="col-span-1 text-right">
                  <button onClick={() => setSelected(b)} className="inline-flex items-center justify-center w-9 h-9 bg-neutral-100 text-neutral-400 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm group-hover:scale-105"><ChevronRight size={18} /></button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-100"><Search className="text-neutral-300" size={24} /></div>
              <h3 className="text-lg font-bold text-neutral-700">No bookings found</h3>
              <p className="text-neutral-400 text-sm max-w-xs mx-auto mt-1">We couldn't find any inquiries matching your search criteria.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
