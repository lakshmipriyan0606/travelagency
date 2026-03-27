import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchMetrics, fetchQueueHealth } from '@/api/admin/metrics.api';
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
import { Activity, Cpu, Database, Globe, ShieldCheck, ShieldX, Clock3 } from 'lucide-react';
import {
    type MetricsRange,
    type MetricsSample,
    buildChartData,
    getInitialHistory,
    mergeSample,
    persistSamples,
    rangeTitle,
} from './metricsChartUtils';

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

interface QueueFailure {
    name: string;
    failCount: number;
    lastFinishedAt: string | null;
    reason: string | null;
}

interface QueueHealth {
    healthy: boolean;
    mongoConnected: boolean;
    agendaWorkerStarted: boolean;
    agendaMarkedStartedAt: string | null;
    recentFailures: QueueFailure[];
}

const normalizeMetricsArray = (data: unknown): MetricItem[] => {
    if (Array.isArray(data)) return data as MetricItem[];
    return [];
};

const getMetricValue = (metrics: MetricItem[], name: string): number => {
    const metric = metrics.find(m => m.name === name);
    return metric?.values[0]?.value || 0;
};

const getMetricSum = (metrics: MetricItem[], name: string): number => {
    const metric = metrics.find(m => m.name === name);
    if (!metric) return 0;
    return metric.values.reduce((acc, val) => acc + (val.value || 0), 0);
};

const MetricsDashboard = () => {
    const [metricsData, setMetricsData] = useState<MetricItem[]>([]);
    const [samples, setSamples] = useState<MetricsSample[]>(() => getInitialHistory());
    const [range, setRange] = useState<MetricsRange>('day');
    const [isLoading, setIsLoading] = useState(true);
    const [queueHealth, setQueueHealth] = useState<QueueHealth | null>(null);

    const chartData = useMemo(() => buildChartData(samples, range), [samples, range]);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const raw = await fetchMetrics();
                const data = normalizeMetricsArray(raw);
                setMetricsData(data);

                const t = Date.now();
                const heapUsed = getMetricValue(data, 'travelagency_nodejs_heap_size_used_bytes') / (1024 * 1024);
                const heapTotal = getMetricValue(data, 'travelagency_nodejs_heap_size_total_bytes') / (1024 * 1024);
                const cpuUser = getMetricValue(data, 'travelagency_process_cpu_user_seconds_total');
                const cpuSystem = getMetricValue(data, 'travelagency_process_cpu_system_seconds_total');
                const totalRequests = getMetricSum(data, 'travelagency_http_requests_public_total');

                setSamples((prev) => {
                    const prevPoint = prev[prev.length - 1];
                    const prevRequests = prevPoint?.requests ?? 0;
                    const requestsDelta = Math.max(0, totalRequests - prevRequests);

                    const sample: MetricsSample = {
                        t,
                        heapUsed: Number(heapUsed.toFixed(1)),
                        heapTotal: Number(heapTotal.toFixed(1)),
                        cpu: Number((cpuUser + cpuSystem).toFixed(2)),
                        requests: totalRequests,
                        requestsDelta,
                    };
                    const merged = mergeSample(prev, sample);
                    persistSamples(merged);
                    return merged;
                });

                const queueRaw = await fetchQueueHealth();
                setQueueHealth({
                    healthy: Boolean(queueRaw?.healthy),
                    mongoConnected: Boolean(queueRaw?.mongoConnected),
                    agendaWorkerStarted: Boolean(queueRaw?.agendaWorkerStarted),
                    agendaMarkedStartedAt: queueRaw?.agendaMarkedStartedAt || null,
                    recentFailures: Array.isArray(queueRaw?.recentFailures) ? queueRaw.recentFailures : [],
                });
            } catch (error) {
                console.error("Failed to load metrics", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMetrics();
        const interval = setInterval(loadMetrics, 3000);
        return () => clearInterval(interval);
    }, []);

    const last = samples[samples.length - 1];
    const currentMemory = last?.heapUsed ?? 0;
    const currentCpu = last?.cpu ?? 0;
    const currentRequests = last?.requests ?? 0;
    const currentRequestsDelta = last?.requestsDelta ?? 0;
    const uptime = getMetricValue(metricsData, 'travelagency_process_uptime_seconds');

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h}h ${m}m ${s}s`;
    };

    const tooltipFormatter = (value: unknown, name: unknown) => {
        const n = String(name);
        const label =
            n === 'heapUsed' ? 'Heap (MB)' :
            n === 'requests' ? 'Production requests (total)' :
            n === 'cpu' ? 'CPU user+system (s)' : n;
        const v = typeof value === 'number' ? value : Number(value);
        const formatted = Number.isFinite(v)
            ? v.toFixed(n === 'heapUsed' ? 1 : 2)
            : String(value ?? '');
        return [formatted, label];
    };

    const tooltipLabelFormatter = (_label: unknown, payload: unknown): ReactNode => {
        const arr = payload as Array<{ payload?: { t?: number } }> | undefined;
        const t = arr?.[0]?.payload?.t;
        if (typeof t === 'number') {
            return new Date(t).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
        }
        return _label as ReactNode;
    };

    if (isLoading && samples.length === 0) {
        return (
            <div className="flex items-center justify-center p-12 h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                        <Activity className="text-primary" /> System Dashboard
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Charts: <span className="font-semibold text-neutral-700">{rangeTitle(range)}</span>
                        <span className="text-neutral-400"> · stored in this browser for trends</span>
                    </p>
                </div>
                <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-100/80 p-1 shadow-inner">
                    {(['day', 'month', 'year'] as const).map((r) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setRange(r)}
                            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                                range === r
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                        >
                            {r === 'day' ? 'Day' : r === 'month' ? 'Month' : 'Year'}
                        </button>
                    ))}
                </div>
            </div>

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

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-800">Booking Queue Health</h3>
                        <p className="text-xs text-neutral-500 mt-1">
                            Tracks worker processing for booking mail and Google Sheet sync.
                        </p>
                    </div>
                    <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            queueHealth?.healthy
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {queueHealth?.healthy ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                        {queueHealth?.healthy ? 'Healthy' : 'Needs Attention'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Mongo Connection</p>
                        <p className={`mt-1 text-sm font-bold ${queueHealth?.mongoConnected ? 'text-green-700' : 'text-red-700'}`}>
                            {queueHealth?.mongoConnected ? 'Connected' : 'Disconnected'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Agenda Worker</p>
                        <p className={`mt-1 text-sm font-bold ${queueHealth?.agendaWorkerStarted ? 'text-green-700' : 'text-red-700'}`}>
                            {queueHealth?.agendaWorkerStarted ? 'Started' : 'Not Started'}
                        </p>
                    </div>
                    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Worker Started At</p>
                        <p className="mt-1 text-sm font-bold text-neutral-700 inline-flex items-center gap-1">
                            <Clock3 size={13} className="text-neutral-500" />
                            {queueHealth?.agendaMarkedStartedAt
                                ? new Date(queueHealth.agendaMarkedStartedAt).toLocaleString()
                                : 'N/A'}
                        </p>
                    </div>
                </div>

                {queueHealth?.recentFailures?.length ? (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-2">Recent Queue Failures</p>
                        <div className="space-y-2">
                            {queueHealth.recentFailures.slice(0, 5).map((f, idx) => (
                                <div key={`${f.name}-${idx}`} className="rounded-lg border border-red-100 bg-white p-2.5">
                                    <p className="text-xs font-bold text-red-700">{f.name} (fails: {f.failCount})</p>
                                    <p className="text-[11px] text-red-800 mt-0.5">{f.reason || 'Unknown reason'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 text-xs text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                        No recent queue failures.
                    </p>
                )}
            </div>

            {chartData.length === 0 && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    No samples in this period yet. Keep this page open; charts fill as metrics are collected. Month/year need data over time in this browser.
                </p>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">Node.js Heap Memory (MB)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
                                <defs>
                                    <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="timeLabel"
                                    tick={{ fontSize: 11, fill: '#888' }}
                                    tickMargin={8}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip
                                    formatter={tooltipFormatter}
                                    labelFormatter={tooltipLabelFormatter}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="heapUsed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMemory)" name="heapUsed" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">API Request Volume</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="timeLabel"
                                    tick={{ fontSize: 11, fill: '#888' }}
                                    tickMargin={8}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip
                                    formatter={tooltipFormatter}
                                    labelFormatter={tooltipLabelFormatter}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="requests" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="requests" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-neutral-800 mb-4">CPU Usage (cumulative seconds)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                <XAxis
                                    dataKey="timeLabel"
                                    tick={{ fontSize: 11, fill: '#888' }}
                                    tickMargin={8}
                                    interval="preserveStartEnd"
                                    minTickGap={28}
                                />
                                <YAxis tick={{ fontSize: 12, fill: '#888' }} />
                                <Tooltip
                                    formatter={tooltipFormatter}
                                    labelFormatter={tooltipLabelFormatter}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="cpu" fill="#f97316" radius={[4, 4, 0, 0]} name="cpu" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetricsDashboard;
