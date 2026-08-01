import { requireB2BAdmin } from "@/features/auth/guards";
import CitiesMasterClient from "@/features/b2b-master/CitiesMasterClient";

export default async function B2BCitiesPage() {
  await requireB2BAdmin();
  return <CitiesMasterClient />;
}
