import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from "@/lib/endpoints";

export interface B2BAgency {
  _id: string;
  companyName: string;
  tradeName?: string;
  businessType: 'travel_agency' | 'tour_operator' | 'dmc' | 'freelance_agent';
  registrationNumber: string;
  country: string;
  gstNumber?: string;
  officeAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  websiteUrl?: string;
  yearsInBusiness?: number;
  iataNumber?: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  rejectionReason?: string;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  changedBy?: {
    name: string;
    email: string;
  };
}



export interface StatusLogEntry {
  _id: string;
  agencyId: string;
  /** Matches AgencyStatusLog.fromStatus on the backend */
  fromStatus: string;
  /** Matches AgencyStatusLog.toStatus on the backend */
  toStatus: string;
  reason?: string;
  changedBy: { name: string; email: string; };
  createdAt: string;
}

export const b2bAdminLogin = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.b2b.login, payload);
  return data;
};

export const b2bAdminForgotPassword = async (payload: { email: string }) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.b2b.forgotPassword, payload);
  return data;
};

export const b2bAdminResetPassword = async (payload: { token: string; password: string }) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.b2b.resetPassword, payload);
  return data;
};

export const b2bAdminLogout = async (refreshToken?: string | null) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.b2b.logout, {
    refreshToken: refreshToken || undefined,
  });
  return data;
};

export const b2bAdminRefresh = async () => {
  const { data } = await axiosClient.post(ENDPOINTS.client.b2b.refresh);
  return data;
};

export const getB2BAgencies = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.b2b.agencies);
  return data?.data?.data || data?.data || [];
};

export const getB2BAgencyById = async (id: string) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.b2b.agencyById(id));
  return data?.data || data;
};

export const approveB2BAgency = async (id: string) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.b2b.agencyAction(id, 'approve'));
  return data;
};

export const rejectB2BAgency = async ({ id, reason }: { id: string; reason: string }) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.b2b.agencyAction(id, 'reject'), { reason });
  return data;
};

export const suspendB2BAgency = async (id: string) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.b2b.agencyAction(id, 'suspend'));
  return data;
};

export const reactivateB2BAgency = async (id: string) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.b2b.agencyAction(id, 'reactivate'));
  return data;
};

export const getB2BAgencyStatusLog = async (id: string) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.b2b.agencyStatusLog(id));
  return data?.data?.data || data?.data || [];
};

// ─── Quote Admin Types ─────────────────────────────────────────────────────────

export interface AdminQuoteRequest {
  _id: string;
  reference: string;
  agencyId: string;
  agencyName?: string;
  agencyTradeName?: string;
  destination: string;
  travelStart: string;
  travelEnd: string;
  adults: number;
  children: number;
  rooms: number;
  budgetCategory: 'economy' | 'standard' | 'premium' | 'luxury';
  status: 'draft' | 'submitted' | 'under_review' | 'vendor_sourcing' | 'quotation_preparation' | 'quotation_ready' | 'revision_requested' | 'quotation_updated' | 'accepted';
  contactPerson: { name: string; email: string; phone: string; designation?: string; };
  adminFeedback?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Quote Admin API Functions ─────────────────────────────────────────────────

export const getAdminQuotes = async (params?: { page?: number; pageSize?: number; status?: string; agencyId?: string }) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.b2b.quotes, { params });
  // sendSuccess(array) → { data: Quote[], meta }
  if (Array.isArray(data?.data)) return data.data as AdminQuoteRequest[];
  if (Array.isArray(data?.data?.data)) return data.data.data as AdminQuoteRequest[];
  if (Array.isArray(data)) return data as AdminQuoteRequest[];
  return [];
};

export const getAdminQuotesByAgency = async (
  agencyId: string,
  params?: { page?: number; pageSize?: number; status?: string },
) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.b2b.quotesByAgency(agencyId), { params });
  if (Array.isArray(data?.data)) return data.data as AdminQuoteRequest[];
  if (Array.isArray(data?.data?.data)) return data.data.data as AdminQuoteRequest[];
  if (Array.isArray(data)) return data as AdminQuoteRequest[];
  return [];
};

export const updateAdminQuoteStatus = async (
  id: string,
  status: string,
  notes?: string,
) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.b2b.quoteStatusUpdate(id), {
    status,
    notes,
    adminFeedback: notes,
  });
  return data?.data || data;
};
