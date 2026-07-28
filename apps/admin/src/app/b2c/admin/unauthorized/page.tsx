import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@travelagency/ui";
import { ROUTES } from "@/lib/routes";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        You do not have the required permissions to access this administrative area.
      </p>
      <Link href={ROUTES.login}>
        <Button variant="default">
          Return to Login
        </Button>
      </Link>
    </div>
  );
}

