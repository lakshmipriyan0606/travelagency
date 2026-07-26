import { Activity, Globe, Users } from 'lucide-react';

interface MetricsStatCardsProps {
    todayVisitors: number;
    totalRequests: number;
}

export const MetricsStatCards = ({ todayVisitors, totalRequests }: MetricsStatCardsProps) => {
    return (
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
    );
};
