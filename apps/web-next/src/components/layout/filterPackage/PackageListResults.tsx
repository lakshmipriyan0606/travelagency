import PackageCard from "../packageCard/PackageCard";
import PackageCardSkeleton from "../packageCard/PackageCardSkeleton";
import NoDataFound from "../NoDataFound/NoDataFound";
import PackageErrorSkeleton from "../packageCard/PackageErrorSkeleton";
import AnimatedButton from "@/components/Button/AnimatedButton/AnimatedButton";
import { FilterState } from "./constant";
import { GLOBAL_CONFIG } from "@/config/globalConfig";

interface PackageListResultsProps {
  packageList: any[];
  filteredPackages: any[];
  groupedPackages: Record<string, any[]>;
  filters: FilterState;
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  totalCount: number;
  resetAndRefetch: () => void;
  refetch: () => void;
  setPackageList: React.Dispatch<React.SetStateAction<any[]>>;
  isAdminMode?: boolean;
}

export const PackageListResults: React.FC<PackageListResultsProps> = ({
  packageList, filteredPackages, groupedPackages, filters, isLoading, isError, hasMore, totalCount, resetAndRefetch, refetch, setPackageList, isAdminMode = false
}) => {
  const citiesFromConfig = GLOBAL_CONFIG.destinations.map((d: { value: string }) => d.value);

  const handleLikeUpdate = (id: string, liked: boolean) => {
    setPackageList((prev) => prev.map((pkg) => (pkg._id === id ? { ...pkg, userLiked: liked } : pkg)));
  };

  if (isError && !packageList.length) {
    return (
      <div className="flex justify-center items-center py-10 w-full min-h-[400px]">
        <PackageErrorSkeleton message="Failed to load packages" onRetry={resetAndRefetch} />
      </div>
    );
  }

  if (isLoading && !packageList.length) {
    return (
      <div className={isAdminMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <PackageCardSkeleton key={n} />)}
      </div>
    );
  }

  if (filteredPackages.length === 0 && !isLoading) {
    return <NoDataFound message="No Packages Found" subMessage="Try adjusting your filters or search criteria." />;
  }

  if (filters.city) {
    return (
      <section key={filters.city} className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1.5 bg-primary rounded-full shadow-sm"></div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
            {filters.city} <span className="text-primary font-medium ml-2">({filteredPackages.length})</span>
          </h2>
        </div>
        <PackageCard filterList={filteredPackages} isAdmin={false} setEditPackageId={() => {}} setActive={() => {}} refetch={resetAndRefetch} handleLikeUpdate={handleLikeUpdate} />
      </section>
    );
  }

  return (
    <div className="space-y-16">
      {citiesFromConfig.map((cityName: string) => {
        const packages = groupedPackages[cityName] || [];
        if (packages.length === 0) return null;
        return (
          <section key={cityName} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 bg-primary rounded-full shadow-sm"></div>
              <h2 className="text-2xl text-gray-900 uppercase">
                {cityName} <span className="text-primary font-medium ml-2">({packages.length})</span>
              </h2>
            </div>
            <PackageCard filterList={packages} isAdmin={false} setEditPackageId={() => {}} setActive={() => {}} refetch={resetAndRefetch} handleLikeUpdate={handleLikeUpdate} />
          </section>
        );
      })}

      {groupedPackages["Other"]?.length > 0 && (
        <section key="Other" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 bg-gray-400 rounded-full shadow-sm"></div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              Other Locations <span className="text-gray-400 font-medium ml-2">({groupedPackages["Other"].length})</span>
            </h2>
          </div>
          <PackageCard filterList={groupedPackages["Other"]} isAdmin={false} setEditPackageId={() => {}} setActive={() => {}} refetch={resetAndRefetch} handleLikeUpdate={handleLikeUpdate} />
        </section>
      )}

      {isLoading && packageList.length > 0 && (
        <div className={isAdminMode ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"}>
          <PackageCardSkeleton />
        </div>
      )}
      {isError && packageList.length > 0 && (
        <div className="text-center py-4 text-red-400 text-sm">Failed to load more packages. Please try again.</div>
      )}
      {hasMore && packageList.length < totalCount && (
        <div className="text-center py-6">
          <AnimatedButton buttonText={isLoading ? "Loading…" : "Load more"} onClick={() => refetch()} className="w-[200px] cursor-pointer" disabled={isLoading} />
        </div>
      )}
    </div>
  );
};
