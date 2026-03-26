import { useEffect, useState } from 'react';
import { fetchMetrics } from '@/api/admin/metrics.api';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { Activity, Cpu, Database, Globe } from 'lucide-react';

interface MetricValue {
    value: number;
    labels?: Record<string, string>;
}

interface MetricItem {
    name: string;
    help: string;
    type: string;
    values: MetricValue[];
}

const normalizeMetricsArray = (data: unknown): MetricItem[] => {
    if (Array.isArray(data)) return data as MetricItem[];
    return [];
};

// Helper to find a specific metric by name
const getMetricValue = (metrics: MetricItem[], name: string): number => {
    const metric = metrics.find(m => m.name === name);
    return metric?.values[0]?.value || 0;
};

// Helper to find sum of specific metric (like http requests with different labels)
const getMetricSum = (metrics: MetricItem[], name: string): number => {
    const metric = metrics.find(m => m.name === name);
    if (!metric) return 0;
    return metric.values.reduce((acc, val) => acc + (val.value || 0), 0);
};

const MetricsDashboard = () => {
    const [metricsData, setMetricsData] = useState<MetricItem[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const raw = await fetchMetrics();
                const data = normalizeMetricsArray(raw);
                setMetricsData(data);
                
                // Parse stats for history charting
                const timestamp = new Date().toLocaleTimeString();
                
                // memory in MB
                const heapUsed = getMetricValue(data, 'travelagency_nodejs_heap_size_used_bytes') / (1024 * 1024);
                const heapTotal = getMetricValue(data, 'travelagency_nodejs_heap_size_total_bytes') / (1024 * 1024);
                
                // cpu (basic raw value, usually seconds total)
                const cpuUser = getMetricValue(data, 'travelagency_process_cpu_user_seconds_total');
                const cpuSystem = getMetricValue(data, 'travelagency_process_cpu_system_seconds_total');
                
                // HTTP requests
                const totalRequests = getMetricSum(data, 'travelagency_http_requests_public_total');

                setHistory(prev => {
                    const prevPoint = prev[prev.length - 1];
                    const prevRequests = prevPoint?.requests ?? 0;
                    const requestsDelta = Math.max(0, totalRequests - prevRequests);

                    const newHistory = [...prev, {
                        time: timestamp,
                        heapUsed: Number(heapUsed.toFixed(1)),
                        heapTotal: Number(heapTotal.toFixed(1)),
                        cpu: Number((cpuUser + cpuSystem).toFixed(2)),
                        requests: totalRequests,
                        requestsDelta
                    }];
                    // Keep last 20 data points
                    return newHistory.slice(-20);
                });
                
            } catch (error) {
                console.error("Failed to load metrics", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMetrics();
        // Poll every 3 seconds
        const interval = setInterval(loadMetrics, 3000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading && history.length === 0) {
        return (
            <div className="flex items-center justify-center p-12 h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Current Stats
    const currentMemory = history[history.length - 1]?.heapUsed || 0;
    const currentCpu = history[history.length - 1]?.cpu || 0;
    const currentRequests = history[history.length - 1]?.requests || 0;
    const currentRequestsDelta = history[history.length - 1]?.requestsDelta || 0;
    const uptime = getMetricValue(metricsData, 'travelagency_process_uptime_seconds');

    // Format Uptime manually
    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <Activity className="text-primary" /> System Dashboard
            </h2>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide border-b border-transparent">Memory Used</p>
                        <h3 className="text-2xl font-black text-neutral-800">{currentMemory.toFixed(1)} <span className="text-sm font-bold text-neutral-400">MB</span></h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                        <Cpu size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide">CPU Seconds</p>
                        <h3 className="text-2xl font-black text-neutral-800">{currentCpu.toFixed(1)} <span className="text-sm font-bold text-neutral-400">s</span></h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                        <Globe size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide">Production API Requests</p>
                        <h3 className="text-2xl font-black text-neutral-800">{currentRequests}</h3>
                        <p className="text-[11px] text-neutral-400 font-bold mt-0.5">
                            +{currentRequestsDelta} / 3s
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500 font-medium tracking-wide">Server Uptime</p>
                        <h3 className="text-xl font-black text-neutral-800">{formatUptime(uptime)}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* Memory Area Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Node.js Heap Memory (MB)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#888' }} tickMargin={10} />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="heapUsed" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMemory)" name="Heap Used" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* HTTP Requests Line Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">API Request Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#888' }} tickMargin={10} />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} name="Total Requests" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CPU Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">CPU Usage Output</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis dataKey="time" tick={{ fontSize: 12, fill: '#888' }} tickMargin={10} />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="cpu" fill="#f97316" radius={[4, 4, 0, 0]} name="CPU User+System (s)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MetricsDashboard;
