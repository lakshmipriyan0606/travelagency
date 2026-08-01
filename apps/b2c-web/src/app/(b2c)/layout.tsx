import Navbar from "@/components/layout/navbar/Navbar";
import Footer from "@/components/layout/footer/Footer";
import VisitorAnalytics from "@/components/layout/VisitorAnalytics";

export default function B2CLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <VisitorAnalytics />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
