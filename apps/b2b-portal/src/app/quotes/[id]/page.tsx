/**
 * B2B Portal — Quote Request Detail Page Shell.
 */
import React from "react";
import { AppShell } from "@/components/layout";

export const metadata = {
  title: "Quote Detail | B2B Portal",
};

export default function QuoteDetailPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Quote Request Details</h1>
            <p className="text-sm text-text-secondary mt-1">Review itinerary proposals and request revisions.</p>
          </div>
          <div className="h-6 w-24 bg-neutral-900 border border-border rounded-full animate-pulse"></div>
        </div>

        {/* Timeline & Details skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-3xl p-8 h-64 animate-pulse"></div>
          </div>
          <div className="bg-surface border border-border rounded-3xl p-8 h-48 animate-pulse"></div>
        </div>
      </div>
    </AppShell>
  );
}
