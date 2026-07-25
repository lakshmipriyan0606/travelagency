import { Users, X, Laptop, Smartphone, Link2, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { VisitorData } from '../types';

interface VisitorChartProps {
    visitorStats: VisitorData[];
    selectedDay: VisitorData | null;
    setSelectedDay: (day: VisitorData | null) => void;
    parseDevice: (ua?: string) => { label: string; isMobile: boolean };
}

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

export const VisitorChart = ({ visitorStats, selectedDay, setSelectedDay, parseDevice }: VisitorChartProps) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-800 mb-6">Daily Unique Visitors (Last 30 Days)</h3>
            <div className="h-[350px] w-full cursor-pointer">
                {visitorStats.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={visitorStats} margin={{ top: 20, right: 20, left: 0, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                            <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#888' }} tickMargin={10} />
                            <YAxis tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                            <Tooltip content={<CustomVisitorTooltip />} cursor={{ fill: '#f8fafc' }} />
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
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                            <p className="text-xs text-neutral-500 font-medium">Total logged</p>
                                            <p className="text-2xl font-black text-blue-600">{selectedDay.details.length}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2 mb-3">
                                        Recent Activity Log
                                    </p>
                                    <div className="space-y-3">
                                        {selectedDay.details.slice(0, 50).map((visitor, idx) => {
                                            const { label: deviceLabel, isMobile } = parseDevice(visitor.userAgent);
                                            const timeStr = visitor.time ? new Date(visitor.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Unknown time';
                                            return (
                                                <div key={idx} className="flex gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                                                    <div className={`mt-0.5 shrink-0 ${isMobile ? 'text-purple-500' : 'text-blue-500'}`}>
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
        </div>
    );
};
