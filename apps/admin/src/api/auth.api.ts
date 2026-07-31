import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from "@/lib/endpoints";

export const loginAPI = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.login, payload);
  return data;
};

export const forgotPasswordAPI = async (payload: { email: string }) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.forgotPassword, payload);
  return data;
};

export const resetPasswordAPI = async (payload: { token: string; password: string }) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.resetPassword, payload);
  return data;
};

export const registerAPI = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.register, payload);
  return data;
};

export const logoutAPI = async () => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.logout);
  return data;
};

export const currentUserAPI = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.auth.session);
  return data;
};

export const CreatePackage = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.createPackage, payload);
  return data;
};
export const UpdatePackage = async (payload: object, id: string) => {
  const { data } = await axiosClient.post(
    ENDPOINTS.client.auth.updatePackage(id),
    payload
  );
  return data;
};
export const GetCurrentPackageDetail = async (id: string) => {
  const { data } = await axiosClient.get(ENDPOINTS.client.auth.packageById(id));
  return data;
};
export const DeleteCurrentPackage = async (id: string) => {
  const { data } = await axiosClient.delete(ENDPOINTS.client.auth.deletePackage(id));
  return data;
};

export const GetAllBookings = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.auth.bookingsAll);
  return data;
};

export const UpdatePackageRank = async ({ id, bestRank }: { id: string; bestRank: string | null }) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.auth.updateRank(id), { bestRank });
  return data;
};

export const TogglePackageStatus = async (id: string) => {
  const { data } = await axiosClient.patch(ENDPOINTS.client.auth.toggleStatus(id));
  return data;
};

export const GetTakenRanks = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.auth.takenRanks);
  return data;
};
