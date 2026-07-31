"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import QuoteWizard from "@/features/quote-request/components/QuoteWizard";
import { AirplaneLoader } from "@travelagency/ui";

function NewQuoteInner() {
  const searchParams = useSearchParams();
  const reviseId = searchParams.get("reviseId") || undefined;
  return <QuoteWizard reviseId={reviseId} />;
}

export default function NewQuoteClient() {
  return (
    <Suspense
      fallback={<AirplaneLoader size="md" label="Loading wizard…" className="py-16" />}
    >
      <NewQuoteInner />
    </Suspense>
  );
}
