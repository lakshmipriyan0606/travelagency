/**
 * B2B Portal — Create Custom Package page (single-page premium composer).
 */
import React from "react";
import { AppShell } from "@/components/layout";
import CustomPackageWizard from "@/features/custom-package/components/CustomPackageWizard";

export const metadata = {
  title: "Create Custom Package | B2B Portal",
  description:
    "Compose a custom package from master cities and hotels with live pricing.",
};

export default function CustomPackagePage() {
  return (
    <AppShell>
      <CustomPackageWizard />
    </AppShell>
  );
}
