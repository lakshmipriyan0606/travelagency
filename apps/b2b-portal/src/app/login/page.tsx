import { Metadata } from "next";
import LoginFormClient from "@/features/auth/components/LoginFormClient";

export const metadata: Metadata = {
  title: "Login | TravelAgency B2B",
  description:
    "Access your B2B travel partner portal for exclusive wholesale pricing and real-time bookings.",
};

export default function LoginPage() {
  return <LoginFormClient />;
}
