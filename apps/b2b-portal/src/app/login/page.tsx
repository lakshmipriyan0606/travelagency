import { Metadata } from "next";
import LoginFormClient from "@/features/auth/components/LoginFormClient";

export const metadata: Metadata = {
  title: "Login | TravelAgency B2B",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
      <LoginFormClient />
    </main>
  );
}
