import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { FilterState, SortOption, buildEmptyFilterConfig, filterPackages, sortPackages, buildURLParams, parseURLParams } from "./constant";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList, GetLikedPackageList } from "@/api/user/api";
import { PACKAGE_CONFIG } from "@/config/packageConfig";

const PAGE_SIZE = PACKAGE_CONFIG.INITIAL_LOAD_LIMIT;

interface UsePackageFilterProps {
  likePackageOnly?: boolean;
  mode?: 'packages' | 'activities' | 'all';
}

export function usePackageFilter({ likePackageOnly = false, mode = 'all' }: UsePackageFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [packageList, setPackageList] = useState<any[]>([]);
  const [cursor, setCursor] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const lastProcessedCursor = useRef<string | null>(null);

  const [activeTab, setActiveTab] = useState<'packages' | 'activities'>('packages');
  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<SortOption>("default");

  const defaultValues = useMemo(() => parseURLParams(`?${searchParams.toString()}`), [searchParams]);
  const methods = useForm<FilterState>({ defaultValues, mode: "onChange" });
  const { watch, setValue, reset } = methods;
  const filters = watch();

  useEffect(() => {
    const params = buildURLParams(filters);
    router.replace(`${pathname}?${params.toString()}`);
  }, [JSON.stringify(filters.filterConfig), filters.city, filters.sort, filters.search, pathname, router]);

  useEffect(() => {
    setSearchInput(filters.search ?? "");
    setSort((filters.sort as SortOption) ?? "default");
  }, []);

  const isAdminMode = false;
  const queryKey = useMemo(
    () => ["allPackage", cursor, filters.search, filters.city, isAdminMode, mode, likePackageOnly, activeTab],
    [cursor, filters.search, filters.city, isAdminMode, mode, likePackageOnly, activeTab]
  );

  const { data, isLoading, isError, refetch } = UseFetchAPIQuery({
    key: queryKey,
    queryFn: () => {
      if (likePackageOnly) {
        const onlyActivities = activeTab === 'activities';
        const excludeActivities = activeTab === 'packages';
        return GetLikedPackageList({ limit: PAGE_SIZE, lastId: cursor, onlyActivities, excludeActivities });
      }
      const onlyActivities = mode === 'activities';
      const excludeActivities = mode === 'packages';
      return GetAllPackageList({
        limit: PAGE_SIZE, lastId: cursor, search: filters.search, city: filters.city,
        isAdmin: isAdminMode, onlyActivities, excludeActivities
      });
    },
    options: { enabled: false },
  });

  useEffect(() => {
    setPackageList([]);
    setCursor("");
    setHasMore(true);
    setTotalCount(0);
    lastProcessedCursor.current = "RESET";
    setTimeout(() => refetch(), 0);
  }, [JSON.stringify(filters.filterConfig), filters.search, filters.city, likePackageOnly, mode, activeTab, refetch]);

  const dataProcessedRef = useRef<any>(null);

  useEffect(() => {
    if (data && data !== dataProcessedRef.current) {
      dataProcessedRef.current = data;
      if (data.data?.length) {
        setPackageList((prev) => {
          const newPkgs = data.data.filter((pkg: any) => !prev.some((p) => p._id === pkg._id));
          return [...prev, ...newPkgs];
        });
      }
      if (data.nextCursor) setCursor(data.nextCursor);
      if (data.totalCount !== undefined) setTotalCount(data.totalCount);
      setHasMore(data.hasMore || false);
    }
  }, [data]);

  const filteredPackages = useMemo(() => {
    const pkgs = filterPackages(packageList, filters);
    let liked = likePackageOnly ? pkgs.filter((p) => p.userLiked) : pkgs;
    if (likePackageOnly) {
      liked = liked.filter((p) => {
        const isActivity = p.type === 'activity' || (p.activityCategory && p.activityCategory !== "" && p.activityCategory !== "none");
        return activeTab === 'activities' ? isActivity : !isActivity;
      });
    }
    return sortPackages(liked, sort);
  }, [packageList, filters, likePackageOnly, sort, activeTab]);

  useEffect(() => {
    if (!likePackageOnly) return;
    const liked = (packageList || []).filter((p) => p.userLiked);
    const likedActivities = liked.filter((p) => p.type === 'activity' || (p.activityCategory && p.activityCategory !== "" && p.activityCategory !== "none")).length;
    const likedPackages = liked.length - likedActivities;

    if (activeTab === 'packages' && likedPackages === 0 && likedActivities > 0) setActiveTab('activities');
    if (activeTab === 'activities' && likedActivities === 0 && likedPackages > 0) setActiveTab('packages');
  }, [likePackageOnly, packageList, activeTab]);

  const handleRemoveTag = useCallback(
    (group: string, value: string) => {
      if (group === "city") setValue("city", "");
      else setValue(`filterConfig.${group}.${value}` as any, false);
    },
    [setValue]
  );

  const handleClearAll = useCallback(() => {
    reset({ filterConfig: buildEmptyFilterConfig(), country: "Malaysia", city: "", search: "", sort: "default" });
    setSearchInput("");
    setSort("default");
  }, [reset]);

  const handleSearch = (customSearch?: string) => {
    const valueToSearch = typeof customSearch === 'string' ? customSearch : searchInput;
    setValue("search", valueToSearch);
  };

  const resetAndRefetch = useCallback(() => {
    setPackageList([]);
    setCursor("");
    setHasMore(true);
    setTotalCount(0);
    lastProcessedCursor.current = "RESET";
    setTimeout(() => refetch(), 0);
  }, [refetch]);

  const groupedPackages = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredPackages.forEach((pkg) => {
      const city = pkg.location || "Other";
      if (!groups[city]) groups[city] = [];
      groups[city].push(pkg);
    });
    return groups;
  }, [filteredPackages]);

  return {
    packageList, setPackageList, cursor, hasMore, totalCount, activeTab, setActiveTab,
    searchInput, setSearchInput, sort, setSort, methods, filters, filteredPackages, groupedPackages,
    isLoading, isError, refetch, handleRemoveTag, handleClearAll, handleSearch, resetAndRefetch
  };
}
