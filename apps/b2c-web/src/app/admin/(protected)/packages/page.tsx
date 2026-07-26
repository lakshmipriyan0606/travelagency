import FilterPackage from "@/components/layout/filterPackage/FilterPackage";

export const metadata = {
  title: "Packages | Admin",
};

export default async function PackagesListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-8 xl:px-16 pt-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tours, activities, and travel packages.</p>
        </div>
      </div>
      
      {/* We apply a negative margin-top because FilterPackage has a lot of top padding by default for B2C pages */}
      <div className="-mt-16">
        <FilterPackage mode="packages" isAdminMode={true} />
      </div>
    </div>
  );
}

