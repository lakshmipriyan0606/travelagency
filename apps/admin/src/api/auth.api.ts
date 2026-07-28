import axiosClient from '@/lib/apiClient';
import { ENDPOINTS } from "@/lib/endpoints";

export const loginAPI = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.auth.login, payload);
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
  const { data } = await axiosClient.get(ENDPOINTS.client.auth.bookingsAll); // Wait, this is booking/all!
  // Wait! In endpoints.ts, bookingsAll is defined under ENDPOINTS.server.bookingsAll (which has /v1/b2c prefix).
  // But here it fetches "admin/bookings/all" with axiosClient!
  // Ah! "admin/bookings/all" in axiosClient gets rewritten to "v1/b2c-admin/admin/bookings/all".
  // Wait, let's look at the original string: "admin/bookings/all".
  // Let's check where that endpoint is defined in endpoints.ts.
  // Wait! In endpoints.ts, did we define `admin/bookings/all`?
  // Let's check: in `endpoints.ts`, under `client.auth.takenRanks` is `admin/packages/takenRanks`.
  // Let's look at what endpoints we mapped under `auth` in endpoints.ts:
  // We missed `admin/bookings/all` in `endpoints.ts` client.auth!
  // Let's add it: `bookingsAll: 'admin/bookings/all'` under `ENDPOINTS.client.auth`!
  // Let's do that! Let's write client.auth.bookingsAll.
  // Let's first make sure we do the replacement, and we will update endpoints.ts.
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
