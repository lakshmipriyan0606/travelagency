"use client";

import { Loader2, Info, Search, Filter } from "lucide-react";
import { Booking } from "../api/bookings.api";
import { useBookingList } from "./BookingList/useBookingList";
import { BookingListTable } from "./BookingList/BookingListTable";
import { BookingListDialog } from "./BookingList/BookingListDialog";

export default function BookingListClient({ initialBookings }: { initialBookings: Booking[] }) {
  const {
    selected, setSelected, searchQuery, setSearchQuery, isLoading, isError,
    filteredBookings, handleWhatsApp, handleQuickReply, visibleErrorLogs, hiddenWhatsAppErrorCount
  } = useBookingList(initialBookings);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-neutral-500 font-medium">Loading items...</p>
      </div>
    );

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-red-50 rounded-3xl border border-red-100">
      <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4"><Info size={24} /></div>
      <h3 className="text-lg font-bold text-red-900">Connection Error</h3>
      <p className="text-red-600/70 max-w-xs mx-auto mt-2">We couldn't fetch the booking list right now. Please check your connection.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Booking Requests</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage and review all incoming travel inquiries</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-neutral-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm w-full sm:w-64 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
          <button className="p-2.5 bg-white border border-neutral-200 rounded-2xl text-neutral-600 hover:bg-neutral-50 hover:text-primary transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <BookingListTable filteredBookings={filteredBookings} setSelected={setSelected} handleWhatsApp={handleWhatsApp} />

      <BookingListDialog 
        selected={selected} 
        setSelected={setSelected} 
        visibleErrorLogs={visibleErrorLogs} 
        hiddenWhatsAppErrorCount={hiddenWhatsAppErrorCount} 
        handleQuickReply={handleQuickReply} 
        handleWhatsApp={handleWhatsApp} 
      />
    </div>
  );
}
