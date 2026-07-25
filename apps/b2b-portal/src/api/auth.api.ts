import axiosClient from "./axiosClient";

export const loginAgent = async (data: any) => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

export const registerAgent = async (data: any) => {
  const payload = { ...data, role: "agent" };
  const res = await axiosClient.post("/auth/register", payload);
  return res.data;
};

export const getAgentProfile = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};
