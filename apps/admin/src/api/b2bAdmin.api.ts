import axiosClient from '@travelagency/api-client';

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
}

export interface StatusLogEntry {
  _id: string;
  agencyId: string;
  previousStatus: string;
  newStatus: string;
  reason?: string;
  changedBy: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export const b2bAdminLogin = async (payload: object) => {
  const { data } = await axiosClient.post("b2b/admin/login", payload);
  return data;
};

export const b2bAdminLogout = async () => {
  const { data } = await axiosClient.post("b2b/admin/logout");
  return data;
};

export const b2bAdminRefresh = async () => {
  const { data } = await axiosClient.post("b2b/admin/refresh");
  return data;
};

export const getB2BAgencies = async () => {
  const { data } = await axiosClient.get("b2b/admin/agencies");
  return data?.data?.data || data?.data || [];
};

export const approveB2BAgency = async (id: string) => {
  const { data } = await axiosClient.patch(`b2b/admin/agencies/${id}/approve`);
  return data;
};

export const rejectB2BAgency = async ({ id, reason }: { id: string; reason: string }) => {
  const { data } = await axiosClient.patch(`b2b/admin/agencies/${id}/reject`, { reason });
  return data;
};

export const suspendB2BAgency = async (id: string) => {
  const { data } = await axiosClient.patch(`b2b/admin/agencies/${id}/suspend`);
  return data;
};

export const reactivateB2BAgency = async (id: string) => {
  const { data } = await axiosClient.patch(`b2b/admin/agencies/${id}/reactivate`);
  return data;
};

export const getB2BAgencyStatusLog = async (id: string) => {
  const { data } = await axiosClient.get(`b2b/admin/agencies/${id}/status-log`);
  return data?.data?.data || data?.data || [];
};
