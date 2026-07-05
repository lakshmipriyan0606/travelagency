import { useEffect, useState } from 'react';
import axiosClient from '@/api/axiosClient';
import { Activity, Globe, Users, Laptop, Smartphone, X, Link2, MapPin } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList
} from 'recharts';

interface VisitorDetail {
    userAgent?: string;
    ip?: string;
    referrer?: string;
    path?: string;
    time: string;
}

interface VisitorData {
    _id: string;
    count: number;
    details?: VisitorDetail[];
}

interface ApiRouteStat {
    route: string;
    method?: string;
    path?: string;
    count: number;
}

interface ApiRouteDetail {
    route: string;
    method?: string;
    path?: string;
    total: number;
    statuses: { status: number; count: number }[];
}

interface ApiUsageData {
    todayTotal: number;
    dailyStats: { _id: string; count: number }[];
    topRoutes: ApiRouteStat[];
    routeDetails: ApiRouteDetail[];
}

const parseDevice = (ua: string | undefined = '') => {
    if (!ua || ua === 'Unknown') return { label: 'Unknown Device', isMobile: false };

    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    const os = /Windows/i.test(ua) ? 'Windows' :
               /Mac OS/i.test(ua) ? 'Mac' :
               /Linux/i.test(ua) ? 'Linux' :
               /Android/i.test(ua) ? 'Android' :
               /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : 'Unknown OS';

    const browser = /Edg/i.test(ua) ? 'Edge' :
                    /Chrome/i.test(ua) ? 'Chrome' :
                    /Firefox/i.test(ua) ? 'Firefox' :
                    /Safari/i.test(ua) ? 'Safari' : 'Unknown Browser';

    return { label: `${os} · ${browser}`, isMobile };
};

const getUtcToday = () => new Date().toISOString().split('T')[0];

const CustomVisitorTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data: VisitorData = payload[0].payload;
        return (
            <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 p-4 rounded-xl shadow-xl shadow-neutral-200/50 min-w-[150px]">
                <p className="text-sm font-bold text-neutral-800 mb-1">{label}</p>
                <p className="text-xs text-neutral-500 font-medium">Total Visitors: <span className="text-blue-600 font-bold">{data.count}</span></p>
                <p className="text-[10px] text-neutral-400 mt-2 font-semibold tracking-wide uppercase">Click bar for details</p>
            </div>
        );
    }
    return null;
};

const CustomApiTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const count = payload[0].value;
        return (
            <div className="bg-white/95 backdrop-blur-xl border border-neutral-200 p-4 rounded-xl shadow-xl shadow-neutral-200/50 min-w-[150px]">
                <p className="text-sm font-bold text-neutral-800 mb-1 break-all">{label}</p>
                <p className="text-xs text-neutral-500 font-medium">Hits: <span className="text-green-600 font-bold">{count}</span></p>
                <p className="text-[10px] text-neutral-400 mt-2 font-semibold tracking-wide uppercase">Click bar for details</p>
            </div>
        );
    }
    return null;
};

const MetricsDashboard = () => {
    const [totalRequests, setTotalRequests] = useState<number>(0);
    const [visitorStats, setVisitorStats] = useState<VisitorData[]>([]);
    const [apiStats, setApiStats] = useState<ApiRouteStat[]>([]);
    const [apiRouteDetails, setApiRouteDetails] = useState<ApiRouteDetail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<VisitorData | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<ApiRouteDetail | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [visitorRes, apiUsageRes] = await Promise.all([
                    axiosClient.get("/analytics/daily"),
                    axiosClient.get("/analytics/api-usage"),
                ]);

                setVisitorStats(visitorRes.data.data || []);

                const apiUsage: ApiUsageData = apiUsageRes.data;
                setTotalRequests(apiUsage.todayTotal || 0);
                setApiStats(apiUsage.topRoutes || []);
                setApiRouteDetails(apiUsage.routeDetails || []);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
        const interval = setInterval(loadDashboardData, 5000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const todayString = getUtcToday();
    const todayVisitors = visitorStats.find(v => v._id === todayString)?.count || 0;

    const handleApiBarClick = (data: any) => {
        const routeLabel = data?.payload?.route;
        if (!routeLabel) return;
        const detail = apiRouteDetails.find(r => r.route === routeLabel);
        if (detail) setSelectedRoute(detail);
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8 relative">
            <div>
                <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                    <Activity className="text-primary" /> System Dashboard
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                    Simplified overview of your application traffic and usage.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide">Unique Visitors Today</p>
                        <h3 className="text-3xl font-black text-neutral-800">{todayVisitors}</h3>
                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Production traffic only (localhost excluded)</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Globe size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide">Production API Requests</p>
                        <h3 className="text-3xl font-black text-neutral-800">{totalRequests}</h3>
                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Total production requests today</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-800 mb-6">Daily Unique Visitors (Last 30 Days)</h3>
                <div className="h-[350px] w-full cursor-pointer">
                    {visitorStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitorStats} margin={{ top: 20, right: 20, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="_id"
                                    tick={{ fontSize: 11, fill: '#888' }}
                                    tickMargin={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#888' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    content={<CustomVisitorTooltip />}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={50}
                                    onClick={(data: any) => setSelectedDay(data?.payload ?? null)}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-sm gap-2 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                            <Users size={32} className="text-neutral-300" />
                            <p>No visitor data available yet. Visit your website to register the first visit!</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-800">Visitor Details</h3>
                                <p className="text-sm text-neutral-500 font-medium">Date: {selectedDay._id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedDay(null)}
                                className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            {(!selectedDay.details || selectedDay.details.length === 0) ? (
                                <p className="text-center text-neutral-400 py-8 text-sm">No detailed records found for this date.</p>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                                        Recent Visitors (Top {selectedDay.details.length})
                                    </p>
                                    <div className="space-y-3">
                                        {selectedDay.details.map((visitor, idx) => {
                                            const { label: deviceLabel, isMobile } = parseDevice(visitor.userAgent);
                                            const timeStr = new Date(visitor.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <div key={idx} className="flex items-start gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-neutral-200 shrink-0 mt-0.5">
                                                        {isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0 space-y-1">
                                                        <p className="text-sm font-bold text-neutral-700 truncate">{deviceLabel}</p>
                                                        <p className="text-xs text-neutral-400 font-medium">{timeStr}</p>
                                                        {visitor.ip && (
                                                            <p className="text-xs text-neutral-500">IP: {visitor.ip}</p>
                                                        )}
                                                        {visitor.path && (
                                                            <p className="text-xs text-neutral-500 flex items-center gap-1 truncate">
                                                                <MapPin size={12} className="shrink-0" />
                                                                {visitor.path}
                                                            </p>
                                                        )}
                                                        {visitor.referrer && (
                                                            <p className="text-xs text-neutral-500 flex items-center gap-1 truncate">
                                                                <Link2 size={12} className="shrink-0" />
                                                                {visitor.referrer}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Globe className="text-green-500" size={20} /> Top 10 Most Used API Routes
                </h3>
                <div className="h-[350px] w-full cursor-pointer">
                    {apiStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={apiStats} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="route"
                                    tick={{ fontSize: 10, fill: '#888' }}
                                    tickMargin={10}
                                    angle={-45}
                                    textAnchor="end"
                                    interval={0}
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#888' }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={<CustomApiTooltip />}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#22c55e"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    onClick={handleApiBarClick}
                                    className="hover:opacity-80 transition-opacity"
                                >
                                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-sm gap-2 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                            <Globe size={32} className="text-neutral-300" />
                            <p>No API usage data available yet. Production traffic will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedRoute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-neutral-50/50">
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-neutral-800">API Route Details</h3>
                                <p className="text-sm text-neutral-500 font-medium break-all">{selectedRoute.route}</p>
                            </div>
                            <button
                                onClick={() => setSelectedRoute(null)}
                                className="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-colors shrink-0 ml-2"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
                                <p className="text-xs text-neutral-500 font-medium">Total hits (last 30 days)</p>
                                <p className="text-2xl font-black text-green-600">{selectedRoute.total}</p>
                            </div>

                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2 mb-3">
                                Status breakdown
                            </p>
                            <div className="space-y-2">
                                {selectedRoute.statuses
                                    .sort((a, b) => b.count - a.count)
                                    .map((s) => (
                                        <div
                                            key={s.status}
                                            className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-100"
                                        >
                                            <span className={`text-sm font-bold ${s.status < 400 ? 'text-green-600' : s.status < 500 ? 'text-amber-600' : 'text-red-600'}`}>
                                                HTTP {s.status}
                                            </span>
                                            <span className="text-sm font-bold text-neutral-700">{s.count} hits</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricsDashboard;
