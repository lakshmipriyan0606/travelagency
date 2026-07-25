import { Metadata } from "next";
import RegisterFormClient from "@/features/auth/components/RegisterFormClient";

export const metadata: Metadata = {
  title: "Apply for Partnership | TravelAgency B2B",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
      <RegisterFormClient />
    </main>
  );
}
