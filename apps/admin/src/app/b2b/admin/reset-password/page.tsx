"use client";

import { Suspense } from "react";
import AdminResetPasswordForm from "@/features/auth/components/AdminResetPasswordForm";
import { b2bAdminResetPassword } from "@/api/b2bAdmin.api";
import { ROUTES } from "@/lib/routes";
import { AdminAuthShell } from "@/components/layout/AdminAuthShell";

export default function B2BResetPasswordPage() {
  return (
    <AdminAuthShell variant="b2b">
      <Suspense
        fallback={
          <div className="w-full max-w-[420px] rounded-[28px] border border-white/10 bg-[#121212]/80 p-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
          </div>
        }
      >
        <AdminResetPasswordForm
          title="Set new password"
          subtitle="Choose a strong password for your B2B admin account."
          loginHref={ROUTES.b2b.login}
          forgotHref={ROUTES.b2b.forgotPassword}
          resetPassword={b2bAdminResetPassword}
        />
      </Suspense>
    </AdminAuthShell>
  );
}
