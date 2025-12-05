import axiosClient from "../axiosClient";

export const GetBestBackageList = async () => {
  const { data } = await axiosClient.get("packages/bestpackages");
  return data;
}
export const GetAllPackageList = async ({ limit = 10, lastId }: { limit: number, lastId: string }) => {
  const { data } = await axiosClient.get(`packages?limit=${limit}&lastId=${lastId ?? ""}`);
  return data;
}
export const GetLikePackageListCount = async () => {
  const { data } = await axiosClient.get("packages/likeCount");
  return data;
}

export const CreateBookingForm = async (formData: any) => {
  const { data } = await axiosClient.post("booking/create", formData);
  return data;
}
export const UpdateLikePackage = async (payload: object) => {
  const { data } = await axiosClient.post("packages/like", payload);
  return data;
}
