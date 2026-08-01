import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { AUTH_COOKIES } from "@travelagency/constants";

/**
 * OTP challenge UI only for signed-in B2C users mid step-up.
 * No access_token → enterprise 404 (not a discoverable login entry).
 */
export default async function DevopsChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(AUTH_COOKIES.ACCESS_TOKEN)?.value;
  if (!token) {
    notFound();
  }

  return children;
}
