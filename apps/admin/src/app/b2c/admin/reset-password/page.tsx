"use client";

import { Suspense } from "react";
import AdminResetPasswordForm from "@/features/auth/components/AdminResetPasswordForm";
import { resetPasswordAPI } from "@/api/auth.api";
import { ROUTES } from "@/lib/routes";
import { AdminAuthShell } from "@/components/layout/AdminAuthShell";

export default function B2CResetPasswordPage() {
  return (
    <AdminAuthShell variant="b2c">
      <Suspense
        fallback={
          <div className="w-full max-w-[420px] rounded-[28px] border border-white/10 bg-[#121212]/80 p-8">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-white/5" />
          </div>
        }
      >
        <AdminResetPasswordForm
          title="Set new password"
          subtitle="Choose a strong password for your admin account."
          loginHref={ROUTES.login}
          forgotHref={ROUTES.forgotPassword}
          resetPassword={resetPasswordAPI}
        />
      </Suspense>
    </AdminAuthShell>
  );
}
