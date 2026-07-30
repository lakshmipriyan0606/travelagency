"use client";

import { useCallback, useEffect, useState } from "react";
import axiosClient from "@/lib/apiClient";
import { ENDPOINTS } from "@/lib/endpoints";
import { Activity, Globe, Users, TrendingUp, Server, BarChart3, Zap, AlertCircle } from "lucide-react";
import { VisitorData, ApiRouteStat, ApiRouteDetail, ApiUsageData } from "../types";
import {
  StatCard,
  SectionHeader,
  DashboardPageHeader,
  LoadingSpinner,
} from "@/components/dashboard";
import { VisitorChart } from "./VisitorChart";
import { ApiUsageChart } from "./ApiUsageChart";
import { ApiPipelineSummary } from "./ApiPipelineSummary";
import { VisitorDistributionBar } from "./VisitorDistributionBar";
import { showToast } from "@/lib/toast";
import { Button } from "@travelagency/ui";

const parseDevice = (ua: string | undefined = "") => {
  if (!ua || ua === "Unknown") return { label: "Unknown Device", isMobile: false };
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const os = /Windows/i.test(ua)
    ? "Windows"
    : /Mac OS/i.test(ua)
      ? "Mac"
      : /Linux/i.test(ua)
        ? "Linux"
        : /Android/i.test(ua)
          ? "Android"
          : /iOS|iPhone|iPad/i.test(ua)
            ? "iOS"
            : "Unknown OS";
  const browser = /Edg/i.test(ua)
    ? "Edge"
    : /Chrome/i.test(ua)
      ? "Chrome"
      : /Firefox/i.test(ua)
        ? "Firefox"
        : /Safari/i.test(ua)
          ? "Safari"
          : "Unknown Browser";
  return { label: `${os} · ${browser}`, isMobile };
};

const getUtcToday = () => new Date().toISOString().split("T")[0];

export default function MetricsDashboardClient() {
  const [totalRequests, setTotalRequests] = useState(0);
  const [visitorStats, setVisitorStats] = useState<VisitorData[]>([]);
  const [apiStats, setApiStats] = useState<ApiRouteStat[]>([]);
  const [apiRouteDetails, setApiRouteDetails] = useState<ApiRouteDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<VisitorData | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<ApiRouteDetail | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadDashboardData = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;
    if (!silent) setIsRefreshing(true);
    try {
      const [visitorRes, apiUsageRes] = await Promise.all([
        axiosClient.get(ENDPOINTS.client.analytics.daily),
        axiosClient.get(ENDPOINTS.client.analytics.apiUsage),
      ]);
      setVisitorStats(visitorRes.data.data || []);
      const apiUsage: ApiUsageData = apiUsageRes.data;
      setTotalRequests(apiUsage.todayTotal || 0);
      setApiStats(apiUsage.topRoutes || []);
      setApiRouteDetails(apiUsage.routeDetails || []);
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
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => loadDashboardData({ silent: true }), 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="h-[60vh]" />;
  }

  const todayString = getUtcToday();
  const todayVisitors = visitorStats.find((v) => v._id === todayString)?.count || 0;
  const totalVisitors = visitorStats.reduce((sum, v) => sum + v.count, 0);
  const avgDailyVisitors =
    visitorStats.length > 0 ? Math.round(totalVisitors / visitorStats.length) : 0;
  const peakDay = visitorStats.reduce(
    (max, v) => (v.count > max.count ? v : max),
    { _id: "", count: 0 }
  );
  const activeRoutes = apiStats.length;
  const topRouteHits = apiStats[0]?.count || 0;

  return (
    <div className="space-y-8 ent-animate-in">
      <DashboardPageHeader
        icon={Activity}
        title="B2C Admin Dashboard"
        subtitle="Traffic, API usage & system health at a glance."
        lastRefresh={lastRefresh}
        isRefreshing={isRefreshing}
        onRefresh={() => loadDashboardData()}
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

      {/* Traffic Overview */}
      <div>
        <SectionHeader icon={Users} title="Traffic Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            label="Visitors Today"
            value={todayVisitors}
            icon={Users}
            accent="#3b82f6"
            sub="Unique visitors"
          />
          <StatCard
            label="Total (30d)"
            value={totalVisitors}
            icon={TrendingUp}
            accent="#6366f1"
            sub="Last 30 days"
          />
          <StatCard
            label="Daily Average"
            value={avgDailyVisitors}
            icon={BarChart3}
            accent="#8b5cf6"
            sub="Per day avg"
          />
          <StatCard
            label="Peak Day"
            value={peakDay.count}
            icon={Zap}
            accent="#f59e0b"
            sub={peakDay._id || "No data"}
          />
          <StatCard
            label="API Requests"
            value={totalRequests}
            icon={Globe}
            accent="#10b981"
            sub="Today (tracked)"
          />
        </div>
      </div>

      {/* API Overview */}
      <div>
        <SectionHeader icon={Server} title="API Overview" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            label="Active Routes"
            value={activeRoutes}
            icon={Server}
            accent="#6366f1"
            sub="Top endpoints"
          />
          <StatCard
            label="Top Route Hits"
            value={topRouteHits}
            icon={Globe}
            accent="#3b82f6"
            sub={apiStats[0]?.route || "No data"}
          />
          <StatCard
            label="Total Requests"
            value={totalRequests}
            icon={Activity}
            accent="#10b981"
            sub="Today"
          />
          <StatCard
            label="Route Details"
            value={apiRouteDetails.length}
            icon={BarChart3}
            accent="#8b5cf6"
            sub="Tracked routes"
          />
        </div>
      </div>

      {visitorStats.length > 0 && (
        <VisitorDistributionBar visitorStats={visitorStats} totalVisitors={totalVisitors} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VisitorChart
          visitorStats={visitorStats}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          parseDevice={parseDevice}
        />
        <div className="space-y-4">
          <ApiPipelineSummary apiStats={apiStats} totalRequests={totalRequests} />
          <ApiUsageChart
            apiStats={apiStats}
            selectedRoute={selectedRoute}
            setSelectedRoute={setSelectedRoute}
            apiRouteDetails={apiRouteDetails}
            compact
          />
        </div>
      </div>
    </div>
  );
}
