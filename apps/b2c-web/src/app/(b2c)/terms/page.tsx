import { Metadata } from "next";
import TermsClient from "./TermsClient";

export const metadata: Metadata = {
  title: "Terms & Conditions | Travel Agency",
  description: "Read the Terms & Conditions of Sastikaa Travel Sdn Bhd. Our policies cover bookings, cancellations, payments, and legal obligations.",
};

export default function TermsPage() {
  return <TermsClient />;
}
