import { requireB2BAdmin } from "@/features/auth/guards";
import PackagesMasterClient from "@/features/b2b-master/PackagesMasterClient";

export default async function B2BPackagesMasterPage() {
  await requireB2BAdmin();
  return <PackagesMasterClient />;
}
