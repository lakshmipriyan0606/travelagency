"use client";

interface AdminAuthCardProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AdminAuthCard({ children, footer }: AdminAuthCardProps) {
  return (
    <div
      className="flex w-full flex-col justify-between rounded-[24px] border border-white/10 p-4 sm:p-5 lg:p-5 xl:p-6"
      style={{
        background: "rgba(18,18,20,0.82)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow:
          "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(248,180,0,0.06), 0 0 48px rgba(248,180,0,0.06)",
      }}
    >
      <div>{children}</div>
      {footer ? (
        <div className="mt-4 border-t border-white/5 pt-3 lg:mt-4 lg:pt-3.5">{footer}</div>
      ) : null}
    </div>
  );
}

export default AdminAuthCard;
