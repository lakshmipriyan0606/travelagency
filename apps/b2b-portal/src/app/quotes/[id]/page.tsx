/**
 * B2B Portal — Quote Request Detail Page.
 */
import QuoteDetailClient from "@/features/quote-request/components/QuoteDetailClient";

export const metadata = {
  title: "Quote Detail | B2B Portal",
};

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuoteDetailClient id={id} />;
}
