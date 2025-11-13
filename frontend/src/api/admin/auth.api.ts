import axiosClient from "../axiosClient";

export const loginAPI = async (payload:object) => {
  const { data } = await axiosClient.post("admin/auth/login", payload);
  return data;
};

export const registerAPI = async (payload:object) => {
  const { data } = await axiosClient.post("admin/auth/register", payload);
  return data;
};

export const logoutAPI = async () => {
  const { data } = await axiosClient.post("admin/auth/logout");
  return data;
};

export const currentUserAPI = async () => {
  const { data } = await axiosClient.get("admin/auth/me");
  return data;
};

export const CreatePackage = async (payload:object) => {
  const { data } = await axiosClient.post("/packages/create",payload);
  return data;
}
