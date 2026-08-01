"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axiosClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";
import {
  Activity,
  Users,
  TrendingUp,
  BarChart3,
  CalendarDays,
  RotateCcw,
  Eye,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import {
  VisitorData,
  VisitorDetail,
  VisitorOverview,
  VisitorDistribution,
  RecentVisitorsResponse,
  unwrapAnalyticsPayload,
} from "../types";
import {
  StatCard,
  SectionHeader,
  DashboardPageHeader,
  LoadingSpinner,
} from "@/components/dashboard";
import { VisitorChart } from "./VisitorChart";
import { VisitorDistributionBar } from "./VisitorDistributionBar";
import { VisitorBreakdownCharts } from "./VisitorBreakdownCharts";
import { VisitorTable } from "./VisitorTable";
import { VisitorProfileDrawer } from "./VisitorProfileDrawer";
import { showToast } from "@/lib/toast";
import { Button } from "@travelagency/ui";

const getUtcToday = () => new Date().toISOString().split("T")[0];

export default function MetricsDashboardClient() {
  const [visitorStats, setVisitorStats] = useState<VisitorData[]>([]);
  const [overview, setOverview] = useState<VisitorOverview | null>(null);
  const [distribution, setDistribution] = useState<VisitorDistribution | null>(null);
  const [recent, setRecent] = useState<RecentVisitorsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [distLoading, setDistLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<VisitorData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [profile, setProfile] = useState<VisitorDetail | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [page, setPage] = useState(1);
  const recentAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const loadRecent = useCallback(async (opts?: { page?: number; search?: string; device?: string }) => {
    recentAbortRef.current?.abort();
    const controller = new AbortController();
    recentAbortRef.current = controller;

    setTableLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(opts?.page ?? page),
        limit: "10",
        days: "30",
      });
      const q = opts?.search ?? debouncedSearch;
      const device = opts?.device ?? deviceFilter;
      if (q) params.set("search", q);
      if (device) params.set("deviceType", device);
      const res = await axiosClient.get(`${ENDPOINTS.client.analytics.visitors}?${params}`, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      const data = unwrapAnalyticsPayload<RecentVisitorsResponse>(res.data);
      setRecent(data);
    } catch (error: unknown) {
      const aborted =
        controller.signal.aborted ||
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code?: string }).code === "ERR_CANCELED");
      if (aborted) return;
      console.error("Failed to load recent visitors", error);
    } finally {
      if (!controller.signal.aborted) setTableLoading(false);
    }
  }, [page, debouncedSearch, deviceFilter]);

  const loadDashboardData = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setIsRefreshing(true);
    setDistLoading(true);
    try {
      const visitorRes = await axiosClient.get(ENDPOINTS.client.analytics.daily);
      const visits = unwrapAnalyticsPayload<VisitorData[]>(visitorRes.data);
      setVisitorStats(Array.isArray(visits) ? visits : []);

      const [overviewSettled, distSettled] = await Promise.allSettled([
        axiosClient.get(ENDPOINTS.client.analytics.overview),
        axiosClient.get(`${ENDPOINTS.client.analytics.distribution}?days=30`),
      ]);

      if (overviewSettled.status === "fulfilled") {
        setOverview(unwrapAnalyticsPayload<VisitorOverview>(overviewSettled.value.data));
      }
      if (distSettled.status === "fulfilled") {
        setDistribution(unwrapAnalyticsPayload<VisitorDistribution>(distSettled.value.data));
      }

      setLastRefresh(new Date());
      setLoadError(null);
    } catch (error: unknown) {
      console.error("Failed to load dashboard data", error);
      const status =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { status?: number } }).response?.status === "number"
          ? (error as { response: { status: number } }).response.status
          : null;
      const message =
        status === 403
          ? "Access denied — admin role required for analytics."
          : status === 404
            ? "Analytics API not found. Check backend routes."
            : "Could not load dashboard metrics. Retry shortly.";
      setLoadError(message);
      if (!silent) {
        showToast({ type: "error", content: message });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setDistLoading(false);
    }
  }, []);

  const openVisitorDay = useCallback(async (day: VisitorData) => {
    setSelectedDay({ ...day, details: day.details });
    setDetailLoading(true);
    try {
      const res = await axiosClient.get(ENDPOINTS.client.analytics.dailyDetail(day._id));
      const detail = unwrapAnalyticsPayload<VisitorData>(res.data);
      if (detail) setSelectedDay(detail);
    } catch (error) {
      console.error("Failed to load visitor details", error);
      showToast({ type: "error", content: "Could not load visitor details for that day." });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openProfile = useCallback(async (visitor: VisitorDetail) => {
    if (!visitor.visitorId) {
      setProfile(visitor);
      return;
    }
    setProfile(visitor);
    setProfileLoading(true);
    try {
      const res = await axiosClient.get(
        ENDPOINTS.client.analytics.visitorProfile(visitor.visitorId, visitor.date)
      );
      const full = unwrapAnalyticsPayload<VisitorDetail>(res.data);
      if (full) setProfile(full);
    } catch (error) {
      console.error("Failed to load visitor profile", error);
      // Keep the sample already shown from the day list / table
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData({ silent: true }), 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  useEffect(() => {
    void loadRecent({ page, search: debouncedSearch, device: deviceFilter });
    return () => {
      recentAbortRef.current?.abort();
    };
  }, [page, debouncedSearch, deviceFilter, loadRecent]);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-[60vh]" />;
  }

  const todayString = getUtcToday();
  const todayVisitors =
    overview?.today ?? visitorStats.find((v) => v._id === todayString)?.count ?? 0;
  const yesterday = overview?.yesterday ?? 0;
  const last7 = overview?.last7d ?? visitorStats.slice(-7).reduce((s, v) => s + v.count, 0);
  const last30 =
    overview?.last30d ?? visitorStats.reduce((sum, v) => sum + v.count, 0);
  const totalUnique = overview?.totalUnique ?? last30;
  const returning = overview?.returning ?? 0;
  const pageViews = overview?.pageViews ?? last30;

  return (
    <div className="space-y-8 ent-animate-in">
      <DashboardPageHeader
        icon={Activity}
        title="B2C Admin Dashboard"
        subtitle="Visitor traffic, profiles & distribution at a glance."
        lastRefresh={lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={() => {
          void loadDashboardData();
          void loadRecent();
        }}
      />

      {loadError && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <p className="text-sm font-medium flex-1">{loadError}</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => loadDashboardData()}
            className="text-xs font-bold"
          >
            Retry
          </Button>
        </div>
      )}

      <div>
        <SectionHeader icon={Users} title="Traffic Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <StatCard
            label="Today"
            value={todayVisitors}
            icon={Users}
            accent="#F8B400"
            sub="Unique visitors"
            trend={overview?.trends.todayVsYesterday}
          />
          <StatCard
            label="Yesterday"
            value={yesterday}
            icon={CalendarDays}
            accent="#3b82f6"
            sub="UTC day"
          />
          <StatCard
            label="Last 7 days"
            value={last7}
            icon={TrendingUp}
            accent="#22c55e"
            sub="Unique visitors"
            trend={overview?.trends.last7d}
          />
          <StatCard
            label="Last 30 days"
            value={last30}
            icon={BarChart3}
            accent="#a855f7"
            sub="Unique visitors"
            trend={overview?.trends.last30d}
          />
          <StatCard
            label="Total unique"
            value={totalUnique}
            icon={UserCheck}
            accent="#06b6d4"
            sub="Distinct passports"
          />
          <StatCard
            label="Returning"
            value={returning}
            icon={RotateCcw}
            accent="#f97316"
            sub="Same ID, multi-visit"
          />
          <StatCard
            label="Page views"
            value={pageViews}
            icon={Eye}
            accent="#e11d48"
            sub="Tracked page views (30d)"
          />
        </div>
      </div>

      {visitorStats.length > 0 && (
        <VisitorDistributionBar visitorStats={visitorStats} totalVisitors={last30} />
      )}

      <div>
        <SectionHeader icon={BarChart3} title="Distribution" />
        <VisitorBreakdownCharts distribution={distribution} loading={distLoading} />
      </div>

      <VisitorChart
        visitorStats={visitorStats}
        selectedDay={selectedDay}
        onSelectDay={openVisitorDay}
        onCloseDay={() => setSelectedDay(null)}
        onViewProfile={(v) => {
          void openProfile({ ...v, date: selectedDay?._id });
        }}
        detailLoading={detailLoading && !!selectedDay}
      />

      <VisitorTable
        items={recent?.items || []}
        total={recent?.total || 0}
        page={recent?.page || page}
        totalPages={recent?.totalPages || 1}
        loading={tableLoading}
        search={search}
        deviceFilter={deviceFilter}
        onSearchChange={setSearch}
        onDeviceFilterChange={(v) => {
          setDeviceFilter(v);
          setPage(1);
        }}
        onPageChange={setPage}
        onViewProfile={(v) => {
          void openProfile(v);
        }}
      />

      {(profile || profileLoading) && (
        <VisitorProfileDrawer
          visitor={profile}
          loading={profileLoading}
          onClose={() => {
            setProfile(null);
            setProfileLoading(false);
          }}
        />
      )}
    </div>
  );
}
