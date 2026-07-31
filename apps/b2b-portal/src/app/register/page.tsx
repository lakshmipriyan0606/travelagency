import { Metadata } from "next";
import RegisterFormClient from "@/features/auth/components/RegisterFormClient";

export const metadata: Metadata = {
  title: "Apply for Partnership | TravelAgency B2B",
  description:
    "Join our B2B travel agency network and unlock exclusive wholesale pricing, real-time bookings, and dedicated support.",
};

export default function RegisterPage() {
  return <RegisterFormClient />;
}
