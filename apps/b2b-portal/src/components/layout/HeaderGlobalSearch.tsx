"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  MapPin,
  User,
} from "lucide-react";
import { Popover, PopoverAnchor, PopoverContent } from "@travelagency/ui";
import { SearchInput } from "@/components/ui/SearchInput";
import { ROUTES } from "@/lib/routes";
import { useQuoteList } from "@/features/quote-request/hooks/useQuotes";
import { quoteService } from "@/features/quote-request/services/quote.service";
import type { QuoteListItem } from "@/features/quote-request/types/quote.types";

const QUICK_LINKS = [
  { href: ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.quotes, label: "Quotation Pipeline", icon: FileText },
  { href: ROUTES.customPackage, label: "Create Custom Package", icon: MapPin },
  { href: ROUTES.profile, label: "Agency Profile", icon: User },
] as const;

const QUOTE_REF_PATTERN = /^QR-/i;

function resolveQuoteId(q: QuoteListItem): string {
  return q.id || (q as { _id?: string })._id || "";
}

function filterQuotes(quotes: readonly QuoteListItem[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return quotes.slice(0, 5);
  return quotes.filter(
    (item) =>
      item.reference.toLowerCase().includes(q) ||
      item.destination.toLowerCase().includes(q)
  ).slice(0, 5);
}

export function HeaderGlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: recentQuotes } = useQuoteList(1, 20);

  useEffect(() => {
    if (pathname.startsWith(ROUTES.quotes)) {
      setValue(urlSearch);
    }
  }, [pathname, urlSearch]);

  const filteredQuotes = useMemo(
    () => filterQuotes(recentQuotes?.data ?? [], value),
    [recentQuotes?.data, value]
  );

  const handleChange = useCallback(
    (next: string) => {
      setValue(next);
      if (!next.trim() && pathname.startsWith(ROUTES.quotes)) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        const qs = params.toString();
        router.push(qs ? `${ROUTES.quotes}?${qs}` : ROUTES.quotes);
      }
    },
    [pathname, router, searchParams]
  );

  const navigateToSearch = useCallback(
    (rawQuery: string) => {
      const query = rawQuery.trim();
      if (!query) {
        router.push(ROUTES.quotes);
        return;
      }

      if (pathname.startsWith(ROUTES.quotes)) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("search", query);
        router.push(`${ROUTES.quotes}?${params.toString()}`);
        setOpen(false);
        return;
      }

      router.push(`${ROUTES.quotes}?search=${encodeURIComponent(query)}`);
      setOpen(false);
    },
    [pathname, router, searchParams]
  );

  const handleSubmit = useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim();
      if (!query) {
        navigateToSearch("");
        return;
      }

      if (QUOTE_REF_PATTERN.test(query)) {
        const cached = recentQuotes?.data ?? [];
        let match = cached.find(
          (q) => q.reference.toLowerCase() === query.toLowerCase()
        );

        if (!match) {
          try {
            const result = await quoteService.getQuotes(1, 50, undefined, query);
            match = result.data.find(
              (q) => q.reference.toLowerCase() === query.toLowerCase()
            );
          } catch {
            // Fall through to pipeline search
          }
        }

        const quoteId = match ? resolveQuoteId(match) : "";
        if (quoteId) {
          router.push(ROUTES.quoteDetail(quoteId));
          setOpen(false);
          return;
        }
      }

      navigateToSearch(query);
    },
    [navigateToSearch, recentQuotes?.data, router]
  );

  const handleFocus = () => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
    }
    setOpen(true);
  };

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const handlePanelPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="w-full">
          <SearchInput
            value={value}
            onChange={handleChange}
            onSubmit={(q) => void handleSubmit(q)}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="center"
        sideOffset={8}
        className="w-[min(100vw-2rem,32rem)] p-0 border-white/[0.08] bg-[#141416] text-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={() => setOpen(false)}
      >
        <div onPointerDown={handlePanelPointerDown}>
          <div className="px-3 py-2 border-b border-white/[0.08]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Quick links
            </p>
          </div>
          <ul className="py-1">
            {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4 text-[#F8B400]" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {filteredQuotes.length > 0 && (
            <>
              <div className="px-3 py-2 border-t border-b border-white/[0.08]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {value.trim() ? "Matching quotes" : "Recent quotes"}
                </p>
              </div>
              <ul className="py-1 max-h-48 overflow-y-auto">
                {filteredQuotes.map((q) => {
                  const quoteId = resolveQuoteId(q);
                  return (
                    <li key={quoteId || q.reference}>
                      <button
                        type="button"
                        onClick={() => {
                          if (quoteId) {
                            router.push(ROUTES.quoteDetail(quoteId));
                          } else {
                            void handleSubmit(q.reference);
                          }
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-white/[0.06] transition-colors group"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-[#F8B400]" />
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-white truncate">
                            {q.reference}
                          </span>
                          <span className="block text-xs text-zinc-500 truncate">
                            {q.destination}
                          </span>
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#F8B400]" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {value.trim() && (
            <div className="border-t border-white/[0.08] p-2">
              <button
                type="button"
                onClick={() => void handleSubmit(value)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-[#F8B400] hover:bg-[#F8B400]/10 transition-colors"
              >
                Search pipeline for &ldquo;{value.trim()}&rdquo;
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
