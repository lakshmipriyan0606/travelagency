import { Globe, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { ApiRouteStat, ApiRouteDetail } from '../types';

interface ApiUsageChartProps {
    apiStats: ApiRouteStat[];
    selectedRoute: ApiRouteDetail | null;
    setSelectedRoute: (route: ApiRouteDetail | null) => void;
    apiRouteDetails: ApiRouteDetail[];
}

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

export const ApiUsageChart = ({ apiStats, selectedRoute, setSelectedRoute, apiRouteDetails }: ApiUsageChartProps) => {
    const handleApiBarClick = (data: any) => {
        const routeLabel = data?.payload?.route;
        if (!routeLabel) return;
        const detail = apiRouteDetails.find(r => r.route === routeLabel);
        if (detail) setSelectedRoute(detail);
    };

    return (
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
                            <YAxis tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomApiTooltip />} />
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
