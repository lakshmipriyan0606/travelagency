import axiosClient from "../axiosClient";

export const GetBestBackageList = async () => {
  const { data } = await axiosClient.get("packages/bestpackages");
  return data;
}
export const GetAllPackageList = async ({ limit = 10, lastId = '', search = '', city = '', isAdmin = false, activityCategory = '', onlyActivities = false, excludeActivities = false }: { limit?: number; lastId?: string, search?: string, city?: string, isAdmin?: boolean, activityCategory?: string, onlyActivities?: boolean, excludeActivities?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  if (lastId) queryParams.append('lastId', lastId);
  if (search) queryParams.append('search', search);
  if (city) queryParams.append('city', city);
  if (isAdmin) queryParams.append('isAdmin', 'true');
  if (activityCategory) queryParams.append('activityCategory', activityCategory);
  if (onlyActivities) queryParams.append('onlyActivities', 'true');
  if (excludeActivities) queryParams.append('excludeActivities', 'true');

  const { data } = await axiosClient.get(`packages?${queryParams.toString()}`);
  return data;
}

export const GetActivityCategories = async () => {
  const { data } = await axiosClient.get('packages/activitycategories');
  return data;
}

export const GetPackageSuggestions = async (query: string) => {
  if (!query) return { locations: [], packages: [] };
  const { data } = await axiosClient.get(`packages/suggestions?q=${encodeURIComponent(query)}`);
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
export const subscribeNewsletter = async (payload: object) => {
  const { data } = await axiosClient.post("newsletter/subscribe", payload);
  return data;
}

export const GetAllReviews = async () => {
  const { data } = await axiosClient.get("reviews", {
    params: { status: "Published" },
  });
  return data;
}
