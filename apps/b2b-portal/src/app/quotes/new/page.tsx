/**
 * B2B Portal — New Quote Request Page.
 */
import React from "react";
import { AppShell } from "@/components/layout";
import NewQuoteClient from "./NewQuoteClient";

export const metadata = {
  title: "New Quote Request | B2B Portal",
  description: "Request a custom travel package quotation from operations.",
};

export default function NewQuotePage() {
  return (
    <AppShell>
      <div className="w-full">
        <NewQuoteClient />
      </div>
    </AppShell>
  );
}
