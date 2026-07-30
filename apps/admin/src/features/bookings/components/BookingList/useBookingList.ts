import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBookings, Booking } from "../../api/bookings.api";

export const SHOW_WHATSAPP_ERRORS = String(process.env.NEXT_PUBLIC_SHOW_WHATSAPP_ERRORS || "false").toLowerCase() === "true";

export const normalizeErrorMessage = (raw: string): string => {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "Unknown error";
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed?.error?.message) return String(parsed.error.message);
    return JSON.stringify(parsed);
  } catch {
    return trimmed;
  }
};

export const isWhatsAppTask = (task?: string) => String(task || "").toLowerCase().includes("whatsapp");

export function bookingHasIntegrationFailures(b: Booking): boolean {
  const statuses = [b.sheetSyncStatus, b.userEmailStatus, b.adminEmailStatus];
  return statuses.some((s) => s && String(s).includes("Failed"));
}

export function useBookingList(initialBookings: Booking[]) {
  const [selected, setSelected] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: getBookings,
    initialData: { bookings: initialBookings },
    // Keep SSR rows visible if a background refetch fails
    placeholderData: (prev) => prev ?? { bookings: initialBookings },
  });

  const visibleErrorLogs = (selected?.errorLogs || []).filter(
    (log) => SHOW_WHATSAPP_ERRORS || !isWhatsAppTask(log.task)
  );
  const hiddenWhatsAppErrorCount = (selected?.errorLogs || []).filter(
    (log) => !SHOW_WHATSAPP_ERRORS && isWhatsAppTask(log.task)
  ).length;

  const filteredBookings = data?.bookings?.filter(b =>
    (b.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (b.bookingId?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (b.destination?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (b.packageName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Hello ${name}, thank you for your inquiry with Travel Agency. How can we help you today?`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleQuickReply = (email: string, name: string, id: string) => {
    const subject = `Regarding your booking request #${id}`;
    const body = `Hello ${name},\n\nThank you for reaching out to Travel Agency. Regarding your inquiry...`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return {
    selected, setSelected, searchQuery, setSearchQuery, isLoading, isError,
    filteredBookings, handleWhatsApp, handleQuickReply, visibleErrorLogs, hiddenWhatsAppErrorCount
  };
}
