import { Server } from "lucide-react";
import { ApiRouteStat } from "../types";

interface ApiPipelineSummaryProps {
  apiStats: ApiRouteStat[];
  totalRequests: number;
}

export function ApiPipelineSummary({ apiStats, totalRequests }: ApiPipelineSummaryProps) {
  const rows = apiStats.slice(0, 5).map((route, i) => ({
    label: route.route,
    count: route.count,
    color: ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-green-500"][i] || "bg-neutral-500",
    bg: ["bg-blue-50", "bg-purple-50", "bg-emerald-50", "bg-amber-50", "bg-green-50"][i] || "bg-neutral-50",
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Server size={16} className="text-indigo-500" />
        <h2 className="font-black text-neutral-800 text-sm">API Route Summary</h2>
      </div>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.bg}`}>
              <span className={`w-2 h-2 rounded-full ${row.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-xs font-semibold text-neutral-600 truncate">{row.label}</span>
                <span className="text-xs font-black text-neutral-800 shrink-0">{row.count}</span>
              </div>
              <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${row.color} rounded-full transition-all duration-500`}
                  style={{ width: totalRequests > 0 ? `${(row.count / totalRequests) * 100}%` : "0%" }}
                />
              </div>
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-xs text-neutral-400 text-center py-2">No API data available yet</p>
        )}
      </div>
    </div>
  );
}
