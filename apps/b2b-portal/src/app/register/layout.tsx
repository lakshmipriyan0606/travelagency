import { AuthShell } from "@/components/layout/AuthShell";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
