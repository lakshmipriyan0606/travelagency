/**
 * B2B Portal — Edit & Resubmit quote after admin requested changes.
 */
import QuoteWizard from "@/features/quote-request/components/QuoteWizard";
import { AppShell } from "@/components/layout";

export const metadata = {
  title: "Edit & Resubmit Quote | B2B Portal",
};

export default async function QuoteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className="w-full">
        <QuoteWizard reviseId={id} />
      </div>
    </AppShell>
  );
}
