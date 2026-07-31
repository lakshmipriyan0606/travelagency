import { AuthShell } from "@/components/layout/AuthShell";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
