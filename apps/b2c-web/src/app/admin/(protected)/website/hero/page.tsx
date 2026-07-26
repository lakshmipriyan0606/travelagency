import { requireAdmin } from "@/features/admin/auth/guards";
import WebsiteHeroClient from "@/features/admin/website-hero/components/WebsiteHeroClient";

export const metadata = {
  title: "Website Hero | Admin",
};

export default async function WebsiteHeroPage() {
  await requireAdmin();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <WebsiteHeroClient />
    </div>
  );
}
