import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@travelagency/ui";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The admin page you are looking for does not exist or has been moved.
      </p>
      <Link href="/admin/dashboard">
        <Button variant="default">
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

