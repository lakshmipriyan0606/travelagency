import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from '@/lib/endpoints';

export const loginAgent = async (data: unknown) => {
  const res = await axiosClient.post(ENDPOINTS.client.login, data);
  return res.data;
};

export const logoutAgent = async (refreshToken?: string | null) => {
  const res = await axiosClient.post(ENDPOINTS.client.logout, {
    refreshToken: refreshToken || undefined,
  });
  return res.data;
};

export const forgotPasswordAgent = async (data: { email: string }) => {
  const res = await axiosClient.post(ENDPOINTS.client.forgotPassword, data);
  return res.data;
};

export const resetPasswordAgent = async (data: { token: string; password: string }) => {
  const res = await axiosClient.post(ENDPOINTS.client.resetPassword, data);
  return res.data;
};

export const registerAgent = async (data: unknown) => {
    const payload = { ...(data as Record<string, unknown>), role: "agent" };
  const res = await axiosClient.post(ENDPOINTS.client.register, payload);
  return res.data;
};

export const getAgentProfile = async () => {
  const res = await axiosClient.get(ENDPOINTS.client.me);
  return res.data;
};

export const updateAgentProfile = async (data: unknown) => {
  const res = await axiosClient.patch(ENDPOINTS.client.me, data);
  return res.data;
};

export const getIssues = async () => {
  const res = await axiosClient.get(ENDPOINTS.client.issues);
  return res.data;
};

export const resubmitCorrection = async (data: unknown) => {
  const res = await axiosClient.patch(ENDPOINTS.client.resubmit, data);
  return res.data;
};

export const getRejectionReason = async () => {
  const res = await axiosClient.get(ENDPOINTS.client.rejectionReason);
  return res.data;
};

export const reapply = async (data: unknown) => {
  const res = await axiosClient.patch(ENDPOINTS.client.reapply, data);
  return res.data;
};
