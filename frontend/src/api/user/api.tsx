import axiosClient from "../axiosClient";

export const GetBestBackageList = async () => {
  const { data } = await axiosClient.get("packages/bestpackages");
  return data;
}
export const GetAllPackageList = async () => {
  const { data } = await axiosClient.get("packages");
  return data;
}

export const CreateBookingForm = async (formData: any) => {
  const { data } = await axiosClient.post("booking/create", formData);
  return data;
}
