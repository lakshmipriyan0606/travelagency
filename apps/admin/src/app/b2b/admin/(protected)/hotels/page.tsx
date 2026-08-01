import { requireB2BAdmin } from "@/features/auth/guards";
import HotelsMasterClient from "@/features/b2b-master/HotelsMasterClient";

export default async function B2BHotelsPage() {
  await requireB2BAdmin();
  return <HotelsMasterClient />;
}
