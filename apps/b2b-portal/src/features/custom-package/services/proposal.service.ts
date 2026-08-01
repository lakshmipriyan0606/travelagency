/**
 * Create Custom Package — service layer (masters + proposals).
 */

import apiClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  CustomProposal,
  MasterCity,
  MasterHotel,
  MasterPackage,
  PriceProposalDTO,
} from "../types/proposal.types";

function unwrapList<T>(body: unknown): T[] {
  const root = body as { data?: unknown };
  if (Array.isArray(root?.data)) return root.data as T[];
  if (
    root?.data &&
    typeof root.data === "object" &&
    Array.isArray((root.data as { data?: unknown }).data)
  ) {
    return (root.data as { data: T[] }).data;
  }
  if (Array.isArray(body)) return body as T[];
  return [];
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

function normalizeProposal(raw: Record<string, unknown>): CustomProposal {
  const id = String(raw._id ?? raw.id ?? "");
  return {
    ...(raw as unknown as CustomProposal),
    id,
    _id: id,
    reference: String(raw.reference ?? ""),
    name: String(raw.name ?? ""),
    status: (raw.status as CustomProposal["status"]) ?? "draft",
    adminFeedback: String(raw.adminFeedback ?? ""),
    destinations: Array.isArray(raw.destinations)
      ? (raw.destinations as CustomProposal["destinations"])
      : [],
    activities: Array.isArray(raw.activities)
      ? (raw.activities as CustomProposal["activities"])
      : [],
    tripDetails: (raw.tripDetails as CustomProposal["tripDetails"]) ?? {
      rooms: 1,
      adults: 2,
      children: 0,
      starRating: 0,
      includeTransfers: true,
    },
    pricing: (raw.pricing as CustomProposal["pricing"]) ?? {
      currency: "USD",
      subtotal: 0,
      transferTotal: 0,
      total: 0,
      breakdown: [],
    },
    createdAt: String(raw.createdAt ?? ""),
    updatedAt: String(raw.updatedAt ?? ""),
  };
}

export const proposalService = {
  async getCities(q?: string): Promise<MasterCity[]> {
    const params = q?.trim() ? { q: q.trim() } : undefined;
    const res = await apiClient.get(ENDPOINTS.client.master.cities, { params });
    return unwrapList<MasterCity>(res.data);
  },

  async getHotels(cityId: string): Promise<MasterHotel[]> {
    if (!cityId) return [];
    const res = await apiClient.get(ENDPOINTS.client.master.hotels, {
      params: { cityId },
    });
    return unwrapList<MasterHotel>(res.data);
  },

  async getPackages(cityId?: string): Promise<MasterPackage[]> {
    const params = cityId ? { cityId } : undefined;
    const res = await apiClient.get(ENDPOINTS.client.master.packages, { params });
    return unwrapList<MasterPackage>(res.data);
  },

  async listProposals(): Promise<CustomProposal[]> {
    const res = await apiClient.get(ENDPOINTS.client.proposals.list);
    return unwrapList<Record<string, unknown>>(res.data).map(normalizeProposal);
  },

  async getProposal(id: string): Promise<CustomProposal> {
    const res = await apiClient.get(ENDPOINTS.client.proposals.byId(id));
    return normalizeProposal(unwrapPayload(res.data ?? {}));
  },

  /** Price (and optionally save/submit) a proposal. POST creates; PUT updates. */
  async priceProposal(
    dto: PriceProposalDTO,
    existingId?: string
  ): Promise<CustomProposal> {
    const body = {
      destinations: dto.destinations,
      tripDetails: dto.tripDetails,
      activities: dto.activities ?? [],
      name: dto.name,
      save: Boolean(dto.save),
    };
    const res = existingId
      ? await apiClient.put(ENDPOINTS.client.proposals.update(existingId), body)
      : await apiClient.post(ENDPOINTS.client.proposals.create, body);
    return normalizeProposal(unwrapPayload(res.data ?? {}));
  },

  /** Resubmit after Needs Changes (revision_requested → submitted). */
  async resubmitProposal(id: string): Promise<CustomProposal> {
    const res = await apiClient.patch(ENDPOINTS.client.proposals.status(id), {
      status: "submitted",
    });
    return normalizeProposal(unwrapPayload(res.data ?? {}));
  },
};

export default proposalService;
