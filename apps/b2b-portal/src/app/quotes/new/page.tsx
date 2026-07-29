/**
 * B2B Portal — New Quote Request Page.
 *
 * Mounts the multi-step QuoteWizard form inside the B2B routing layout.
 */
import React from "react";
import QuoteWizard from "@/features/quote-request/components/QuoteWizard";
import { AppShell } from "@/components/layout";

export const metadata = {
  title: "New Quote Request | B2B Portal",
  description: "Request a custom travel package quotation from operations.",
};

export default function NewQuotePage() {
  return (
    <AppShell>
      <div className="w-full max-w-4xl mx-auto">
        <QuoteWizard />
      </div>
    </AppShell>
  );
}
