import { Metadata } from "next";
import ForgotPasswordFormClient from "@/features/auth/components/ForgotPasswordFormClient";

export const metadata: Metadata = {
  title: "Forgot Password | TravelAgency B2B",
  description: "Reset your B2B partner portal password.",
};

export default function ForgotPasswordPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans p-6"
      style={{ background: "#080810" }}
    >
      <div className="absolute inset-0 pointer-events-none login-grid-bg opacity-60" />
      <div
        className="absolute pointer-events-none animate-gold-glow"
        style={{
          top: "-20%",
          left: "-10%",
          width: "55%",
          height: "55%",
          background: "radial-gradient(ellipse, rgba(248,180,0,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div className="relative z-10 w-full flex justify-center">
        <ForgotPasswordFormClient />
      </div>
    </main>
  );
}
