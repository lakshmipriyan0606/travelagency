"use client";

import AdminForgotPasswordForm from "@/features/auth/components/AdminForgotPasswordForm";
import { forgotPasswordAPI } from "@/api/auth.api";
import { ROUTES } from "@/lib/routes";
import { AdminAuthShell } from "@/components/layout/AdminAuthShell";

export default function B2CForgotPasswordPage() {
  return (
    <AdminAuthShell variant="b2c">
      <AdminForgotPasswordForm
        title="Forgot password"
        subtitle="Enter your admin email and we'll send a reset link."
        loginHref={ROUTES.login}
        requestReset={forgotPasswordAPI}
      />
    </AdminAuthShell>
  );
}
