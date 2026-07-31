"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  MessageSquareWarning,
  Pencil,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { ROUTES } from "@/lib/routes";
import { useQuoteDetail } from "@/features/quote-request/hooks/useQuotes";
import { QUOTE_STATUS_META } from "@/features/quote-request/config/quote.config";
import { QuoteStatus } from "@/features/quote-request/types/quote.types";
import { AirplaneLoader, Button } from "@travelagency/ui";

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function QuoteDetailClient({ id }: { id: string }) {
  const { data: quote, isLoading, error } = useQuoteDetail(id);
  const meta = quote ? QUOTE_STATUS_META[quote.status] : null;
  const needsChanges = quote?.status === QuoteStatus.REVISION_REQUESTED;
  const timeline = quote?.timeline?.length
    ? [...quote.timeline].slice().reverse()
    : [];

  return (
    <AppShell>
      <div className="ent-animate-in mx-auto w-full max-w-6xl space-y-6 pb-10">
        <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Link
              href={ROUTES.quotes}
              className="mt-1 inline-flex size-9 items-center justify-center rounded-xl border border-white/[0.1] bg-[#121212] text-zinc-400 transition-colors hover:border-[#F8B400]/35 hover:text-[#F8B400]"
              aria-label="Back to quotation pipeline"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {quote?.reference || "Quote detail"}
              </h1>
              <p className="mt-1 text-xs text-zinc-400">
                Review status, admin feedback, and timeline.
              </p>
            </div>
          </div>
          {needsChanges ? (
            <Button asChild size="sm" className="rounded-xl">
              <Link href={ROUTES.quoteEdit(id)}>
                <Pencil size={14} />
                Edit & Resubmit
              </Link>
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <AirplaneLoader />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {(error as Error)?.message || "Failed to load quote."}
          </div>
        ) : null}

        {quote && meta ? (
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
            {/* ── Left: details ─────────────────────────────── */}
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${meta.colorClass}`}
                >
                  {meta.label}
                </span>
                <span className="text-xs text-zinc-500">{meta.description}</span>
              </div>

              {needsChanges && quote.adminFeedback ? (
                <div className="flex gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
                  <MessageSquareWarning
                    className="mt-0.5 shrink-0 text-amber-400"
                    size={18}
                  />
                  <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Admin comment — please update and resubmit
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-amber-50/90">
                      {quote.adminFeedback}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#171717] p-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD54A]">
                    Travel
                  </p>
                  <p className="flex items-center gap-2 text-sm font-semibold text-white">
                    <MapPin size={14} className="text-[#F8B400]" />
                    {quote.destination || "—"}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-zinc-400">
                    <Calendar size={12} />
                    {formatDate(quote.travelStart)} – {formatDate(quote.travelEnd)}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-zinc-400">
                    <Users size={12} />
                    {quote.adults} adults
                    {quote.children > 0 ? `, ${quote.children} children` : ""} ·{" "}
                    {quote.rooms} rooms
                  </p>
                  <p className="text-xs capitalize text-zinc-400">
                    Budget: {quote.budgetCategory}
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#171717] p-5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#FFD54A]">
                    Contact
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {quote.contactPerson?.name || "—"}
                  </p>
                  <p className="text-xs text-zinc-400">{quote.contactPerson?.email}</p>
                  <p className="text-xs text-zinc-400">{quote.contactPerson?.phone}</p>
                  {quote.contactPerson?.designation ? (
                    <p className="text-xs text-zinc-500">
                      {quote.contactPerson.designation}
                    </p>
                  ) : null}
                </div>
              </div>

              {(quote.preferredHotels ||
                quote.specialRequirements ||
                quote.transfers ||
                quote.meals) && (
                <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-[#171717] p-5 text-xs text-zinc-400">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#FFD54A]">
                    Preferences
                  </p>
                  <p className="capitalize">Transfers: {quote.transfers || "—"}</p>
                  <p className="capitalize">Meals: {quote.meals || "—"}</p>
                  <p>Guide: {quote.guideRequired ? "Yes" : "No"}</p>
                  {quote.preferredHotels ? (
                    <p>Hotels: {quote.preferredHotels}</p>
                  ) : null}
                  {quote.specialRequirements ? (
                    <p className="whitespace-pre-wrap border-t border-white/[0.06] pt-2">
                      {quote.specialRequirements}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {/* ── Right: timeline track ─────────────────────── */}
            <aside className="xl:sticky xl:top-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#171717] p-5 shadow-[0_8px_28px_rgba(0,0,0,0.25)]">
                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#FFD54A]">
                  Timeline
                </p>
                {timeline.length ? (
                  <ol className="relative space-y-0 pl-0">
                    {/* Continuous vertical track */}
                    <span
                      aria-hidden
                      className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-[#F8B400] via-[#F8B400]/40 to-transparent"
                    />
                    {timeline.map((event, i) => (
                      <li
                        key={`${event.status}-${event.timestamp}-${i}`}
                        className="relative flex gap-3 pb-6 last:pb-0"
                      >
                        <span
                          className={`relative z-[1] mt-1 size-[15px] shrink-0 rounded-full border-2 border-[#0A0A0A] ring-2 ${
                            i === 0
                              ? "bg-[#F8B400] ring-[#F8B400]/35"
                              : "bg-[#F8B400]/50 ring-[#F8B400]/15"
                          }`}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-white">
                            {event.label}
                          </p>
                          {event.description ? (
                            <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">
                              {event.description}
                            </p>
                          ) : null}
                          <p className="mt-1 text-[10px] text-zinc-500">
                            {formatDate(event.timestamp)}
                            {event.actor ? ` · ${event.actor}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-zinc-500">No timeline events yet.</p>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
