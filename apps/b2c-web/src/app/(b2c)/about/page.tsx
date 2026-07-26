import { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Us | Travel Agency",
  description: "Learn more about our mission, vision, and the passionate team behind your unforgettable travel experiences.",
};

export default function AboutPage() {
  return <AboutClient />;
}
