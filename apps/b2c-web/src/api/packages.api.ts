/**
 * packages.api.ts
 * B2C-facing package API actions: ranking, status toggle, delete.
 * These are used by the customer-facing PackageCard (admin actions surfaced in B2C).
 */
import axiosClient from '@travelagency/api-client';

export const DeleteCurrentPackage = async (id: string) => {
  const { data } = await axiosClient.delete(`admin/packages/deletePackage/${id}`);
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
