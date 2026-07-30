"use client";

import { useState } from "react";
import { ClipboardList, Info, Search, Filter } from "lucide-react";
import { AirplaneLoader } from "@travelagency/ui";
import { Booking } from "../api/bookings.api";
import { useBookingList } from "./BookingList/useBookingList";
import { BookingListTable } from "./BookingList/BookingListTable";
import { BookingListCards } from "./BookingList/BookingListCards";
import { BookingListDialog } from "./BookingList/BookingListDialog";
import { ViewMode, ViewModeToggle } from "@/components/common/ViewModeToggle";

export default function BookingListClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const {
    selected, setSelected, searchQuery, setSearchQuery, isLoading, isError,
    filteredBookings, handleWhatsApp, handleQuickReply, visibleErrorLogs, hiddenWhatsAppErrorCount
  } = useBookingList(initialBookings);

  if (isLoading)
    return <AirplaneLoader size="lg" label="Loading bookings…" fullPage className="py-20" />;

  if (isError && !(filteredBookings?.length || initialBookings.length)) return (
    <div className="admin-surface flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/15 text-red-400 border border-red-500/20 mb-4">
        <Info size={24} />
      </div>
      <h3 className="text-lg font-bold text-white tracking-tight">Connection Error</h3>
      <p className="text-white/55 max-w-xs mx-auto mt-2 text-sm leading-relaxed">
        We couldn&apos;t fetch the booking list right now. Please check your connection.
      </p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="ent-gold-bar h-7 shrink-0" />
            <ClipboardList className="text-[#F8B400] shrink-0" size={24} />
            Booking Requests
          </h1>
          <p className="text-sm text-white/60 mt-1.5 ml-[15px]">
            Manage and review all incoming travel inquiries
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:flex-none group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none group-focus-within:text-[#F8B400] transition-colors"
            />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-field w-full sm:w-64 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
            />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-white/55 border border-white/[0.1] bg-white/[0.03] hover:bg-[#F8B400]/10 hover:text-[#F8B400] hover:border-[#F8B400]/25 transition-all"
            title="Filter"
            aria-label="Filter bookings"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="admin-surface p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h3 className="text-sm font-semibold text-white/80 tracking-tight">
            Incoming Inquiries
            <span className="ml-2 tabular-nums text-white/45 font-medium">
              ({filteredBookings?.length || 0})
            </span>
          </h3>
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
        </div>

        {viewMode === "list" ? (
          <BookingListTable
            filteredBookings={filteredBookings}
            setSelected={setSelected}
            handleWhatsApp={handleWhatsApp}
          />
        ) : (
          <BookingListCards
            filteredBookings={filteredBookings}
            setSelected={setSelected}
            handleWhatsApp={handleWhatsApp}
          />
        )}
      </div>

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
