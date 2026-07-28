import axiosClient from '@travelagency/api-client';
import { ENDPOINTS } from '@/lib/endpoints';

export const GetBestBackageList = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.bestPackages);
  return data;
}

export const GetBestActivitiesList = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.bestActivities);
  return data;
}

export const GetAllPackageList = async ({ limit = 10, lastId = '', search = '', city = '', activityCategory = '', onlyActivities = false, excludeActivities = false }: { limit?: number; lastId?: string, search?: string, city?: string, activityCategory?: string, onlyActivities?: boolean, excludeActivities?: boolean }) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append('limit', limit.toString());
  if (lastId) queryParams.append('lastId', lastId);
  if (search) queryParams.append('search', search);
  if (city) queryParams.append('city', city);
  if (activityCategory) queryParams.append('activityCategory', activityCategory);
  if (onlyActivities) queryParams.append('onlyActivities', 'true');
  if (excludeActivities) queryParams.append('excludeActivities', 'true');

  const { data } = await axiosClient.get(`${ENDPOINTS.client.packages}?${queryParams.toString()}`);
  return data;
}

export const GetActivityCategories = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.activityCategories);
  return data;
}

export const GetPackageSuggestions = async (query: string) => {
  if (!query) return { locations: [], packages: [] };
  const { data } = await axiosClient.get(ENDPOINTS.client.packageSuggestions(query));
  return data;
}

export const GetLikePackageListCount = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.packageLikeCount);
  return data;
}

export const GetLikedPackageList = async ({
  limit = 10,
  lastId = "",
  onlyActivities = false,
  excludeActivities = false,
}: {
  limit?: number;
  lastId?: string;
  onlyActivities?: boolean;
  excludeActivities?: boolean;
}) => {
  const queryParams = new URLSearchParams();
  if (limit) queryParams.append("limit", limit.toString());
  if (lastId) queryParams.append("lastId", lastId);
  if (onlyActivities) queryParams.append("onlyActivities", "true");
  if (excludeActivities) queryParams.append("excludeActivities", "true");
  const { data } = await axiosClient.get(`${ENDPOINTS.client.packageLiked}?${queryParams.toString()}`);
  return data;
};

export const CreateBookingForm = async (formData: any) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.bookingCreate, formData);
  return data;
}

export const UpdateLikePackage = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.packageLike, payload);
  return data;
}

export const subscribeNewsletter = async (payload: object) => {
  const { data } = await axiosClient.post(ENDPOINTS.client.newsletterSubscribe, payload);
  return data;
}

export const GetAllReviews = async () => {
  const { data } = await axiosClient.get(ENDPOINTS.client.reviews, {
    params: { status: "Published" },
  });
  return data;
}
