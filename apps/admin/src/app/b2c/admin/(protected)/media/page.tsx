import { requireAdmin } from "@/features/auth/guards";
import MediaGalleryClient from "@/features/media/components/MediaGalleryClient";

export const metadata = {
  title: "Media Gallery | Admin",
};

export default async function MediaPage() {
  await requireAdmin();

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24">
      <MediaGalleryClient />
    </div>
  );
}
