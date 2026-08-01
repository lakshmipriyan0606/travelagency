/**
 * B2B Portal — My Proposals list page.
 */
import React from "react";
import { AppShell } from "@/components/layout";
import ProposalsListClient from "@/features/custom-package/components/ProposalsListClient";

export const metadata = {
  title: "My Proposals | B2B Portal",
  description: "Saved custom package proposals for your agency.",
};

export default function ProposalsPage() {
  return (
    <AppShell>
      <ProposalsListClient />
    </AppShell>
  );
}
