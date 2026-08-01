import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { DevopsSessionGate } from "@/features/devops/components/DevopsSessionGate";

export default async function DevopsProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await cookies()).get("devops_session")?.value;
  if (!session) {
    notFound();
  }

  return <DevopsSessionGate>{children}</DevopsSessionGate>;
}
