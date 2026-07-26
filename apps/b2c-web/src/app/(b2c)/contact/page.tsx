import { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Travel Agency",
  description: "Contact Sastikaa Travel Sdn Bhd for tour packages, bookings, and enquiries. Find our address in Kuala Lumpur and reach us via WhatsApp or email.",
};

export default function ContactPage() {
  return <ContactClient />;
}
