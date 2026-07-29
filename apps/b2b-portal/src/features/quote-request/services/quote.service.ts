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
} from '../types/quote.types';

export const quoteService = {
  /**
   * Retrieves a list of quote requests for the current partner agency.
   */
  async getQuotes(
    page = 1,
    pageSize = 10,
    status?: string
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
    const res = await apiClient.get(ENDPOINTS.client.quotes.list, { params });
    // The backend standard response maps the list under `data` and paginated metadata under `meta`
    return {
      data: res.data.data,
      total: res.data.meta?.total || res.data.data.length,
      page: res.data.meta?.page || page,
      pageSize: res.data.meta?.pageSize || pageSize,
      hasMore: res.data.meta?.hasMore || false,
    };
  },

  /**
   * Retrieves detail info for a single quote request by ID.
   */
  async getQuoteById(id: string): Promise<QuoteRequest> {
    const res = await apiClient.get(ENDPOINTS.client.quotes.byId(id));
    return res.data.data;
  },

  /**
   * Submits a new quote request.
   */
  async createQuote(dto: CreateQuoteDTO): Promise<QuoteRequest> {
    const res = await apiClient.post(ENDPOINTS.client.quotes.create, dto);
    return res.data.data;
  },

  /**
   * Saves progress on a quote request as draft.
   */
  async saveDraft(id: string, dto: SaveDraftDTO): Promise<{ id: string; reference: string }> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.saveDraft(id), dto);
    return res.data.data;
  },

  /**
   * Accepts a prepared quotation.
   */
  async acceptQuote(id: string): Promise<QuoteRequest> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.status(id), { status: 'accepted' });
    return res.data.data;
  },

  /**
   * Requests revision on a prepared quotation.
   */
  async requestRevision(id: string, internalNotes: string): Promise<QuoteRequest> {
    const res = await apiClient.patch(ENDPOINTS.client.quotes.status(id), {
      status: 'revision_requested',
      internalNotes,
    });
    return res.data.data;
  },
};
export default quoteService;
