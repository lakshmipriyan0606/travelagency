import { redirect } from "next/navigation";
import { requireB2BAdmin } from "@/features/auth/guards";
import { ROUTES } from "@/lib/routes";

/** Legacy route — custom proposals now live under Agency Details → Custom Packages. */
export default async function B2BCustomProposalsPage() {
  await requireB2BAdmin();
  redirect(ROUTES.b2b.agencyDetails);
}
