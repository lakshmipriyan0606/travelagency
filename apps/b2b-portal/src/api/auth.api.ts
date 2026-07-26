import axiosClient from '@travelagency/api-client';

export const loginAgent = async (data: unknown) => {
  const res = await axiosClient.post("/b2b/agency/login", data);
  return res.data;
};

export const registerAgent = async (data: unknown) => {
  const payload = { ...data, role: "agent" };
  const res = await axiosClient.post("/b2b/agency/register", payload);
  return res.data;
};

export const getAgentProfile = async () => {
  const res = await axiosClient.get("/b2b/agency/me");
  return res.data;
};

export const getIssues = async () => {
  const res = await axiosClient.get("/b2b/agency/me/issues");
  return res.data;
};

export const resubmitCorrection = async (data: unknown) => {
  const res = await axiosClient.patch("/b2b/agency/me/resubmit", data);
  return res.data;
};

export const getRejectionReason = async () => {
  const res = await axiosClient.get("/b2b/agency/me/rejection-reason");
  return res.data;
};

export const reapply = async (data: unknown) => {
  const res = await axiosClient.patch("/b2b/agency/me/reapply", data);
  return res.data;
};
