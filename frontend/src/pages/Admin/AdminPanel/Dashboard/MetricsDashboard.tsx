import { useEffect, useState } from 'react';
import { fetchMetrics } from '@/api/admin/metrics.api';
import axiosClient from '@/api/axiosClient';
import { Activity, Globe, Users, Laptop, Smartphone, X } from 'lucide-react';
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
    time: string;
}

interface VisitorData {
    _id: string; // Date (YYYY-MM-DD)
    count: number;
    details?: VisitorDetail[];
}

// Helper to parse a clean device/browser name from raw user agent
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

const MetricsDashboard = () => {
    const [totalRequests, setTotalRequests] = useState<number>(0);
    const [visitorStats, setVisitorStats] = useState<VisitorData[]>([]);
    const [apiStats, setApiStats] = useState<{ route: string, count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<VisitorData | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const rawMetrics = await fetchMetrics();
                const metricsData = Array.isArray(rawMetrics) ? rawMetrics : [];
                
                // Process API Requests Total
                const requestMetric = metricsData.find(m => m.name === 'travelagency_http_requests_public_total');
                const values = requestMetric?.values || [];
                const sum = values.reduce((acc: number, val: {value: number}) => acc + (val.value || 0), 0);
                setTotalRequests(sum);

                // Process API Requests By Route for Chart
                const routeMap: Record<string, number> = {};
                values.forEach((v: any) => {
                    const method = v.labels?.method || 'GET';
                    const route = v.labels?.route || 'Unknown';
                    // Clean up route names slightly (e.g. remove trailing slashes)
                    const cleanRoute = route === '/' ? '/' : route.replace(/\/$/, '');
                    const key = `${method} ${cleanRoute}`;
                    routeMap[key] = (routeMap[key] || 0) + (v.value || 0);
                });
                
                // Convert to array, sort by highest count, take top 10
                const apiChartData = Object.entries(routeMap)
                    .map(([route, count]) => ({ route, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);
                
                setApiStats(apiChartData);

                // Fetch Daily Visitors
                const visitorRes = await axiosClient.get("/analytics/daily");
                setVisitorStats(visitorRes.data.data || []);
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

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset*60*1000));
    const todayString = localDate.toISOString().split("T")[0];
    
    const todayVisitors = visitorStats.find(v => v._id === todayString)?.count || 0;

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
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Globe size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide">Production API Requests</p>
                        <h3 className="text-3xl font-black text-neutral-800">{totalRequests}</h3>
                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">Total requests since last restart</p>
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

            {/* Visitor Details Modal */}
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
                                                <div key={idx} className="flex items-center gap-4 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm border border-neutral-200 shrink-0">
                                                        {isMobile ? <Smartphone size={18} /> : <Laptop size={18} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-neutral-700 truncate">{deviceLabel}</p>
                                                        <p className="text-xs text-neutral-400 font-medium mt-0.5">{timeStr}</p>
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

            {/* API Usage Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
                    <Globe className="text-green-500" size={20} /> Top 10 Most Used API Routes
                </h3>
                <div className="h-[350px] w-full">
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
                                />
                                <YAxis 
                                    tick={{ fontSize: 12, fill: '#888' }} 
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [value as number, "Requests"]}
                                    labelFormatter={(label: any) => `Route: ${label}`}
                                />
                                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40}>
                                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={11} fontWeight="bold" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-sm gap-2 bg-neutral-50 rounded-xl border border-dashed border-neutral-200">
                            <Globe size={32} className="text-neutral-300" />
                            <p>No API usage data available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetricsDashboard;
