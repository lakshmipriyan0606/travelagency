"use client";

import AdminForgotPasswordForm from "@/features/auth/components/AdminForgotPasswordForm";
import { b2bAdminForgotPassword } from "@/api/b2bAdmin.api";
import { ROUTES } from "@/lib/routes";
import { AdminAuthShell } from "@/components/layout/AdminAuthShell";

export default function B2BForgotPasswordPage() {
  return (
    <AdminAuthShell variant="b2b">
      <AdminForgotPasswordForm
        title="Forgot password"
        subtitle="Enter your B2B admin email and we'll send a reset link."
        loginHref={ROUTES.b2b.login}
        requestReset={b2bAdminForgotPassword}
      />
    </AdminAuthShell>
  );
}
