import Link from "next/link";
import { FileQuestion, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@travelagency/ui";

import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div
      data-admin-portal
      className="min-h-screen bg-[#07080c] text-zinc-100 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F8B400]/40 before:to-transparent">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#F8B400]/15 flex items-center justify-center border border-[#F8B400]/25">
            <FileQuestion className="text-[#F8B400]" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F8B400]">
              Admin Portal
            </p>
            <h1 className="text-lg font-black text-zinc-100">Page not found</h1>
          </div>
        </div>

        <p className="text-6xl font-black tabular-nums tracking-tight text-[#F8B400] mb-3">
          404
        </p>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          This route does not exist or has been removed. Check the URL, or
          return to a known workspace below.
        </p>

        <div className="flex flex-col gap-3">
          <Button asChild variant="default" className="w-full">
            <Link href={ROUTES.dashboard}>
              <LayoutDashboard size={16} />
              Back to B2C dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href={ROUTES.devops.login()}>
              <Shield size={16} />
              DevOps login (today)
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
