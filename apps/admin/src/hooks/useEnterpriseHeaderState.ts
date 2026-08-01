"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  HeaderHelpItem,
  HeaderNotification,
  HeaderSearchResult,
} from "@travelagency/ui";
import {
  getB2BAgencies,
  getAdminQuotes,
  type B2BAgency,
  type AdminQuoteRequest,
} from "@/api/b2bAdmin.api";
import { ROUTES } from "@/lib/routes";

const B2B_HELP_ITEMS: HeaderHelpItem[] = [
  {
    label: "Email B2B operations",
    description: "Escalate agency or quote issues",
    href: "mailto:b2b-ops@travelhero.com",
    external: true,
  },
  {
    label: "Agencies dashboard",
    description: "Review partner onboarding pipeline",
    href: ROUTES.b2b.dashboard,
  },
];

const B2C_HELP_ITEMS: HeaderHelpItem[] = [
  {
    label: "Email support",
    description: "Reach the content operations desk",
    href: "mailto:support@travelhero.com",
    external: true,
  },
  {
    label: "System dashboard",
    description: "Return to the B2C admin overview",
    href: ROUTES.dashboard,
  },
];

function filterAgencies(agencies: B2BAgency[], query: string): HeaderSearchResult[] {
  const q = query.toLowerCase();
  return agencies
    .filter(
      (agency) =>
        agency.companyName.toLowerCase().includes(q) ||
        agency.tradeName?.toLowerCase().includes(q) ||
        agency.country.toLowerCase().includes(q)
    )
    .slice(0, 4)
    .map((agency) => ({
      id: `agency-${agency._id}`,
      label: agency.companyName,
      sublabel: `Agency · ${agency.status.replace(/_/g, " ")}`,
      href: ROUTES.b2b.agencyDetail({ agencyId: agency._id, section: "info" }),
    }));
}

function filterQuotes(quotes: AdminQuoteRequest[], query: string): HeaderSearchResult[] {
  const q = query.toLowerCase();
  return quotes
    .filter(
      (quote) =>
        quote.reference.toLowerCase().includes(q) ||
        quote.destination.toLowerCase().includes(q) ||
        quote.agencyName?.toLowerCase().includes(q)
    )
    .slice(0, 4)
    .map((quote) => ({
      id: `quote-${quote._id}`,
      label: quote.reference,
      sublabel: `${quote.destination} · ${quote.agencyName ?? "Agency"}`,
      href: ROUTES.b2b.agencyDetail({
        agencyId: quote.agencyId,
        section: "quotes",
        quoteId: quote._id,
      }),
    }));
}

function buildB2BNotifications(
  agencies: B2BAgency[],
  quotes: AdminQuoteRequest[]
): HeaderNotification[] {
  const pendingAgencies = agencies
    .filter((agency) => agency.status === "pending")
    .map((agency) => ({
      id: `pending-${agency._id}`,
      title: "Agency pending approval",
      message: `${agency.companyName} registered and awaits review.`,
      timestamp: agency.createdAt,
      href: ROUTES.b2b.agencyDetail({ agencyId: agency._id, section: "info" }),
      isRead: false,
    }));

  const activeQuotes = quotes
    .filter((quote) =>
      ["submitted", "under_review", "revision_requested", "quotation_ready"].includes(
        quote.status
      )
    )
    .map((quote) => ({
      id: `quote-${quote._id}`,
      title: "Quote needs attention",
      message: `${quote.reference} · ${quote.agencyName ?? "Agency"} — ${quote.status.replace(/_/g, " ")}`,
      timestamp: quote.updatedAt,
      href: ROUTES.b2b.agencyDetail({
        agencyId: quote.agencyId,
        section: "quotes",
        quoteId: quote._id,
      }),
      isRead: false,
    }));

  return [...pendingAgencies, ...activeQuotes]
    .sort(
      (a, b) =>
        new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
    )
    .slice(0, 12);
}

export function useB2BEnterpriseHeaderState(searchValue: string) {
  const { data: agencies = [], isFetching: agenciesLoading } = useQuery({
    queryKey: ["b2b-header-agencies"],
    queryFn: getB2BAgencies,
    staleTime: 60_000,
  });

  const { data: quotes = [], isFetching: quotesLoading } = useQuery({
    queryKey: ["b2b-header-quotes"],
    queryFn: () => getAdminQuotes({ pageSize: 100 }),
    staleTime: 60_000,
  });

  const trimmed = searchValue.trim();
  const searchResults = useMemo(() => {
    if (trimmed.length < 2) return [];
    return [
      ...filterAgencies(agencies, trimmed),
      ...filterQuotes(quotes, trimmed),
    ].slice(0, 8);
  }, [agencies, quotes, trimmed]);

  const notifications = useMemo(
    () => buildB2BNotifications(agencies, quotes),
    [agencies, quotes]
  );

  const defaultSearchHref =
    trimmed.length >= 2
      ? `${ROUTES.b2b.agencyDetails}?q=${encodeURIComponent(trimmed)}`
      : ROUTES.b2b.dashboard;

  return {
    searchResults,
    isSearchLoading: trimmed.length >= 2 && (agenciesLoading || quotesLoading),
    notifications,
    helpItems: B2B_HELP_ITEMS,
    defaultSearchHref,
  };
}

export function useB2CEnterpriseHeaderState(
  searchValue: string,
  navItems: Array<{ label: string; href: string }>
) {
  const trimmed = searchValue.trim();

  const searchResults = useMemo(() => {
    if (trimmed.length < 2) return [];
    return navItems
      .filter(
        (item) =>
          item.href &&
          item.href !== "#" &&
          item.label.toLowerCase().includes(trimmed.toLowerCase())
      )
      .slice(0, 8)
      .map((item) => ({
        id: item.href,
        label: item.label,
        sublabel: "Admin section",
        href: item.href,
      }));
  }, [navItems, trimmed]);

  return {
    searchResults,
    isSearchLoading: false,
    notifications: [] as HeaderNotification[],
    helpItems: B2C_HELP_ITEMS,
    defaultSearchHref:
      searchResults[0]?.href ??
      (trimmed.length >= 2
        ? `${ROUTES.packages.list}?search=${encodeURIComponent(trimmed)}`
        : ROUTES.dashboard),
  };
}
