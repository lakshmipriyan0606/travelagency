import { requireAdmin } from "@/features/admin/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, FileText, MapPin } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your travel agency platform.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-gray-500">Migration in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-gray-500">Migration in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-gray-500">Migration in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Destinations</CardTitle>
            <MapPin className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-gray-500">Migration in progress</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Activity size={20} />
            System Migration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p>
            Welcome <strong>{admin.name || "Admin"}</strong>. The Admin UI is currently migrating to the Next.js App Router architecture. 
            The shell layout and authentication boundaries are fully operational. CRUD pages (Packages, Blogs, etc.) will be migrated in subsequent sprints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
