import axiosClient from "../axiosClient";

export const loginAPI = async (payload: object) => {
  const { data } = await axiosClient.post("admin/login", payload);
  return data;
};

export const registerAPI = async (payload: object) => {
  const { data } = await axiosClient.post("admin/register", payload);
  return data;
};

export const logoutAPI = async () => {
  const { data } = await axiosClient.post("admin/logout");
  return data;
};

export const currentUserAPI = async () => {
  const { data } = await axiosClient.get("admin/session");
  return data;
};

export const CreatePackage = async (payload: object) => {
  const { data } = await axiosClient.post("admin/packages/create", payload);
  return data;
};
export const UpdatePackage = async (payload: Object | any, id: string | any) => {
  const { data } = await axiosClient.post(
    `admin/packages/updatePackage/${id}`,
    payload
  );
  return data;
};
export const GetCurrentPackageDetail = async (id: string | any) => {
  const { data } = await axiosClient.get(`admin/packages/${id}`);
  return data;
};
export const DeleteCurrentPackage = async (id: string) => {
  const { data } = await axiosClient.delete(`admin/packages/deletePackage/${id}`);
  return data;
};

export const GetAllBookings = async () => {
  const { data } = await axiosClient.get("admin/bookings/all");
  return data;
};

export const UpdatePackageRank = async ({ id, bestRank }: { id: string; bestRank: string | null }) => {
  const { data } = await axiosClient.patch(`admin/packages/updateRank/${id}`, { bestRank });
  return data;
};

export const TogglePackageStatus = async (id: string) => {
  const { data } = await axiosClient.patch(`admin/packages/toggleStatus/${id}`);
  return data;
};

export const GetTakenRanks = async () => {
  const { data } = await axiosClient.get("admin/packages/takenRanks");
  return data;
};
