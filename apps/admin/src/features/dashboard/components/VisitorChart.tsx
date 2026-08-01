import { Users, X, Laptop, Smartphone, Tablet, Loader2, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { VisitorData, VisitorDetail } from "../types";
import { PanelCard, EmptyState } from "@/components/dashboard";

interface VisitorChartProps {
  visitorStats: VisitorData[];
  selectedDay: VisitorData | null;
  onSelectDay: (day: VisitorData) => void;
  onCloseDay: () => void;
  onViewProfile: (visitor: VisitorDetail) => void;
  detailLoading?: boolean;
}

const AXIS = { fill: "#a1a1aa", fontSize: 11 };
const GRID = "#27272a";

function DeviceIcon({ type }: { type?: string }) {
  if (type === "mobile") return <Smartphone size={16} className="text-purple-400" />;
  if (type === "tablet") return <Tablet size={16} className="text-amber-400" />;
  return <Laptop size={16} className="text-blue-400" />;
}

const CustomVisitorTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: VisitorData }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#16161b]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-xl min-w-[150px]">
        <p className="text-sm font-bold text-white mb-1">{label}</p>
        <p className="text-xs text-zinc-400 font-medium">
          Unique: <span className="text-[#F8B400] font-bold">{data.count}</span>
        </p>
        {data.pageViews != null && (
          <p className="text-xs text-zinc-500 mt-1">Page views: {data.pageViews}</p>
        )}
        <p className="text-[10px] text-zinc-500 mt-2 font-semibold tracking-wide uppercase">
          Click bar for details
        </p>
      </div>
    );
  }
  return null;
};

export function VisitorChart({
  visitorStats,
  selectedDay,
  onSelectDay,
  onCloseDay,
  onViewProfile,
  detailLoading,
}: VisitorChartProps) {
  return (
    <PanelCard icon={Users} title="Daily Unique Visitors (Last 30 Days)">
      <div className="h-[350px] w-full cursor-pointer -m-2">
        {visitorStats.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitorStats} margin={{ top: 20, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
              <XAxis dataKey="_id" tick={AXIS} tickMargin={10} />
              <YAxis tick={AXIS} allowDecimals={false} />
              <Tooltip content={<CustomVisitorTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar
                dataKey="count"
                fill="#F8B400"
                radius={[4, 4, 0, 0]}
                barSize={50}
                onClick={(item: { payload?: VisitorData } | VisitorData) => {
                  const day =
                    item && typeof item === "object" && "payload" in item
                      ? (item.payload as VisitorData | undefined)
                      : (item as VisitorData | undefined);
                  if (day?._id) onSelectDay(day);
                }}
                className="hover:opacity-80 transition-opacity"
              >
                <LabelList dataKey="count" position="top" fill="#a1a1aa" fontSize={11} fontWeight="bold" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={Users}
            title="No visitor data yet"
            description="Visit your website to register the first visit!"
          />
        )}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#16161b] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.03]">
              <div>
                <h3 className="text-lg font-bold text-white">Day Visitors</h3>
                <p className="text-sm text-zinc-400 font-medium">
                  Date: {selectedDay._id} · {selectedDay.count} unique
                </p>
              </div>
              <button
                type="button"
                onClick={onCloseDay}
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {detailLoading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-zinc-400 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Loading details…
                </div>
              ) : !selectedDay.details || selectedDay.details.length === 0 ? (
                <p className="text-center text-zinc-500 py-8 text-sm">
                  No detailed records found for this date.
                </p>
              ) : (
                <div className="space-y-3">
                  {selectedDay.details.map((visitor, idx) => {
                    const timeStr = visitor.lastVisit || visitor.time
                      ? new Date(visitor.lastVisit || visitor.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      : "Unknown time";
                    const deviceLabel =
                      [visitor.os || visitor.deviceType, visitor.browser]
                        .filter(Boolean)
                        .join(" · ") || "Unknown device";
                    return (
                      <div
                        key={`${visitor.visitorId}-${idx}`}
                        className="flex gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/10"
                      >
                        <div className="mt-0.5 shrink-0">
                          <DeviceIcon type={visitor.deviceType} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-zinc-200 truncate">{deviceLabel}</p>
                            <button
                              type="button"
                              onClick={() => onViewProfile(visitor)}
                              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#F8B400] hover:underline"
                            >
                              <Eye size={12} /> Profile
                            </button>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium">{timeStr}</p>
                          {visitor.visitorId && (
                            <p className="text-[11px] font-mono text-zinc-600 truncate">
                              {visitor.visitorId}
                            </p>
                          )}
                          {(visitor.currentPage || visitor.path) && (
                            <p className="text-xs text-zinc-400 truncate">
                              {visitor.currentPage || visitor.path}
                            </p>
                          )}
                          {visitor.country && (
                            <p className="text-xs text-zinc-500">{visitor.country}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PanelCard>
  );
}
