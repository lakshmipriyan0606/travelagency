import { config } from "@/lib/config";
import { ROUTES } from "@/lib/routes";
import { ENDPOINTS } from "@/lib/endpoints";
import { getAccessToken } from "@travelagency/auth";
import CatalogListClient from "@/features/catalog-list/CatalogListClient";
import type { CatalogItem } from "@/features/catalog-list/types";

export const metadata = {
  title: "Activities | Admin",
};

function parsePackageList(json: unknown): CatalogItem[] {
  if (!json || typeof json !== "object") return [];
  const body = json as Record<string, unknown>;
  const candidates = [body.data, body.packages, body.items, json];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as CatalogItem[];
  }
  return [];
}

async function getActivities(): Promise<CatalogItem[]> {
  try {
    const token = await getAccessToken();
    const res = await fetch(`${config.apiBaseUrl}${ENDPOINTS.server.activities}`, {
      headers: token ? { Cookie: `access_token=${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return parsePackageList(json);
  } catch {
    return [];
  }
}

export default async function ActivitiesListPage() {
  const activities = await getActivities();

  return (
    <CatalogListClient
      items={activities}
      config={{
        title: "Activity Management",
        subtitle: "Manage all activity-type packages.",
        emptyLabel: "No activities found",
        createLabel: "New Activity",
        createHref: ROUTES.activities.new,
        editHrefBase: ROUTES.activities.list,
        secondaryColumn: "Category",
        mode: "activities",
      }}
    />
  );
}
