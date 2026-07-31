/**
 * Quote Request Feature — service layer.
 *
 * Interfaces with the production backend REST APIs using the Axios apiClient.
 */

import apiClient from '@/lib/apiClient';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  QuoteListItem,
  QuoteRequest,
  CreateQuoteDTO,
  SaveDraftDTO,
  QuoteTimelineEvent,
} from '../types/quote.types';
import { QuoteStatus } from '../types/quote.types';

/** Pull draft id from any sendSuccess shape (nested data, flattened doc, double-wrap). */
function extractDraftId(body: Record<string, unknown> | null | undefined): string | null {
  if (!body || typeof body !== "object") return null;
  const data = body.data as Record<string, unknown> | undefined;
  const nestedData =
    data?.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : undefined;
  const candidates = [
    data?.id,
    data?._id,
    nestedData?.id,
    nestedData?._id,
    body.id,
    body._id,
  ];
  for (const candidate of candidates) {
    if (candidate == null) continue;
    const value = String(candidate);
    if (value && value !== "undefined" && value !== "null" && value !== "new") {
      return value;
    }
  }
  return null;
}

function unwrapPayload(body: Record<string, unknown>): Record<string, unknown> {
  const data = body?.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const nested = data as Record<string, unknown>;
    if (nested.data && typeof nested.data === "object" && !Array.isArray(nested.data)) {
      return nested.data as Record<string, unknown>;
    }
    return nested;
  }
  return body;
}

function normalizeQuote(raw: Record<string, unknown>): QuoteRequest {
  const id = String(raw._id ?? raw.id ?? "");
  const timeline = Array.isArray(raw.timeline)
    ? (raw.timeline as QuoteTimelineEvent[])
    : [];
  return {
    ...(raw as unknown as QuoteRequest),
    id,
    adminFeedback:
      typeof raw.adminFeedback === "string" ? raw.adminFeedback : undefined,
    timeline,
  };
}

function normalizeListItem(raw: Record<string, unknown>): QuoteListItem {
  return {
    id: String(raw._id ?? raw.id ?? ""),
    reference: String(raw.reference ?? ""),
    destination: String(raw.destination ?? ""),
    travelStart: String(raw.travelStart ?? ""),
    travelEnd: String(raw.travelEnd ?? ""),
    adults: Number(raw.adults ?? 1),
    children: Number(raw.children ?? 0),
    status: (raw.status as QuoteStatus) ?? QuoteStatus.DRAFT,
    budgetCategory: raw.budgetCategory as QuoteListItem["budgetCategory"],
    contactPerson: raw.contactPerson as QuoteListItem["contactPerson"],
    adminFeedback:
      typeof raw.adminFeedback === "string" ? raw.adminFeedback : undefined,
    createdAt: String(raw.createdAt ?? ""),
  };
}

export const quoteService = {
  async getQuotes(
    page = 1,
    pageSize = 10,
    status?: string,
    search?: string
  ): Promise<{
    data: readonly QuoteListItem[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    const params: Record<string, string | number> = { page, pageSize };
    if (status) {
      params.status = status;
    }
    if (search?.trim()) {
      params.search = search.trim();
    }
    const res = await apiClient.get(ENDPOINTS.client.quotes.list, { params });
    const rows = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      data: rows.map((row: Record<string, unknown>) => normalizeListItem(row)),
      total: res.data.meta?.total || rows.length,
      page: res.data.meta?.page || page,
      pageSize: res.data.meta?.pageSize || pageSize,
      hasMore: res.data.meta?.hasMore || false,
    };
  },

  async getQuoteById(id: string): Promise<QuoteRequest> {
    const res = await apiClient.get(ENDPOINTS.client.quotes.byId(id));
    const raw = unwrapPayload(res.data ?? {});
    return normalizeQuote(raw);
  },

  async createQuote(dto: CreateQuoteDTO): Promise<QuoteRequest> {
    const res = await apiClient.post(ENDPOINTS.client.quotes.create, dto);
    const raw = unwrapPayload(res.data ?? {});
    return normalizeQuote(raw);
  },

  async saveDraft(id: string, dto: SaveDraftDTO): Promise<{ id: string; reference: string }> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.saveDraft(id), dto);
    const body = res.data ?? {};
    const draftId = extractDraftId(body);
    const reference =
      body?.data?.reference ?? body?.reference ?? body?.data?.data?.reference ?? "";
    if (!draftId) {
      throw new Error("Draft saved but no id was returned from the API");
    }
    return { id: draftId, reference: String(reference) };
  },

  async acceptQuote(id: string): Promise<QuoteRequest> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.status(id), { status: 'accepted' });
    const raw = unwrapPayload(res.data ?? {});
    return normalizeQuote(raw);
  },

  async requestRevision(id: string, internalNotes: string): Promise<QuoteRequest> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.status(id), {
      status: 'revision_requested',
      internalNotes,
    });
    const raw = unwrapPayload(res.data ?? {});
    return normalizeQuote(raw);
  },

  async resubmitQuote(id: string): Promise<QuoteRequest> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.status(id), {
      status: QuoteStatus.SUBMITTED,
    });
    const raw = unwrapPayload(res.data ?? {});
    return normalizeQuote(raw);
  },

  async deleteQuote(id: string): Promise<{ id: string; reference: string }> {
    const res = await apiClient.delete(ENDPOINTS.client.quotes.delete(id));
    return res.data.data;
  },
};
export default quoteService;
