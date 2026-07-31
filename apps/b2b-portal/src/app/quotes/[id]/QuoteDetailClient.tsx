"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  MapPin,
  MessageSquareWarning,
  Pencil,
  Send,
  Users,
} from "lucide-react";
import { AppShell } from "@/components/layout";
import { useQuoteDetail, useResubmitQuote } from "@/features/quote-request/hooks/useQuotes";
import { QUOTE_STATUS_META } from "@/features/quote-request/config/quote.config";
import { QuoteStatus } from "@/features/quote-request/types/quote.types";
import { ROUTES } from "@/lib/routes";
import { AirplaneLoader, Button } from "@travelagency/ui";

export default function QuoteDetailClient() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");
  const { data: quote, isLoading, error, refetch } = useQuoteDetail(id);
  const resubmit = useResubmitQuote();

  const meta = quote ? QUOTE_STATUS_META[quote.status] : null;
  const needsChanges = quote?.status === QuoteStatus.REVISION_REQUESTED;

  return (
    <AppShell>
      <div className="space-y-6 ent-animate-in max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.push(ROUTES.quotes)}
              className="mt-1 rounded-lg border border-white/[0.1] p-2 text-zinc-400 hover:text-[#F8B400] hover:border-[#F8B400]/40"
              aria-label="Back to pipeline"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {quote?.reference || "Quote detail"}
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Review status, admin comments, and resubmit when needed.
              </p>
            </div>
          </div>
          {quote && meta ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${meta.colorClass}`}
            >
              {meta.label}
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <AirplaneLoader size="md" label="Loading quote…" className="py-16" />
        ) : error || !quote ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center space-y-3">
            <p className="text-sm text-red-300">Could not load this quote.</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <>
            {needsChanges && quote.adminFeedback ? (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquareWarning size={16} className="text-amber-400" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                    Admin requested changes
                  </p>
                </div>
                <p className="text-sm text-amber-50/90 leading-relaxed">{quote.adminFeedback}</p>
              </div>
            ) : null}

            {meta ? (
              <p className="text-sm text-zinc-400">{meta.description}</p>
            ) : null}

            <div className="rounded-2xl border border-white/[0.08] bg-[#171717] p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex gap-2">
                  <MapPin size={14} className="text-[#F8B400] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                      Destination
                    </p>
                    <p className="text-white font-semibold">{quote.destination || "—"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Calendar size={14} className="text-[#F8B400] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                      Travel dates
                    </p>
                    <p className="text-white font-semibold">
                      {quote.travelStart
                        ? new Date(quote.travelStart).toLocaleDateString()
                        : "—"}{" "}
                      –{" "}
                      {quote.travelEnd
                        ? new Date(quote.travelEnd).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Users size={14} className="text-[#F8B400] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                      Guests
                    </p>
                    <p className="text-white font-semibold">
                      {quote.adults} adults
                      {quote.children > 0 ? `, ${quote.children} children` : ""} ·{" "}
                      {quote.rooms} rooms
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    Budget
                  </p>
                  <p className="text-white font-semibold capitalize">{quote.budgetCategory}</p>
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-4">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
                  Contact
                </p>
                <p className="text-white text-sm font-semibold">
                  {quote.contactPerson?.name}
                </p>
                <p className="text-zinc-400 text-xs">
                  {quote.contactPerson?.email} · {quote.contactPerson?.phone}
                </p>
              </div>
            </div>

            {quote.timeline?.length ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#171717] p-5">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#F8B400]/80 mb-3">
                  Timeline
                </p>
                <ul className="space-y-3">
                  {[...quote.timeline].reverse().map((ev, i) => (
                    <li key={`${ev.status}-${ev.timestamp}-${i}`} className="text-sm">
                      <p className="text-white font-semibold">{ev.label}</p>
                      {ev.description ? (
                        <p className="text-zinc-400 text-xs mt-0.5">{ev.description}</p>
                      ) : null}
                      <p className="text-zinc-600 text-[10px] mt-1">
                        {ev.timestamp
                          ? new Date(ev.timestamp).toLocaleString()
                          : ""}
                        {ev.actor ? ` · ${ev.actor}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {needsChanges ? (
                <>
                  <Button asChild className="rounded-xl font-bold">
                    <Link href={`${ROUTES.quoteNew}?reviseId=${quote.id}`}>
                      <Pencil size={16} />
                      Edit &amp; Resubmit
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl font-bold"
                    disabled={resubmit.isPending}
                    onClick={async () => {
                      await resubmit.mutateAsync(quote.id);
                      refetch();
                    }}
                  >
                    {resubmit.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Resubmit as-is
                  </Button>
                </>
              ) : null}
              <Button asChild variant="secondary" className="rounded-xl">
                <Link href={ROUTES.quotes}>Back to pipeline</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
