"use client";

import type { ReactNode, ComponentType } from "react";
import {
  X,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Monitor,
  Wifi,
  MapPin,
  Link2,
  Clock,
  Fingerprint,
  Copy,
  Download,
  Eye,
  MousePointerClick,
  ScrollText,
  Gauge,
  Languages,
  Cookie,
} from "lucide-react";
import { VisitorDetail } from "../types";

interface VisitorProfileDrawerProps {
  visitor: VisitorDetail | null;
  loading?: boolean;
  onClose: () => void;
}

function deviceIcon(type?: string) {
  if (type === "mobile") return Smartphone;
  if (type === "tablet") return Tablet;
  return Laptop;
}

function fmtTime(v?: string) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

function fmtMs(v?: number) {
  if (v == null || !Number.isFinite(v)) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

function Row({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold shrink-0">
        {label}
      </span>
      <span className="text-sm text-zinc-200 text-right break-all">{value ?? "—"}</span>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="text-xs font-black uppercase tracking-wider text-[#F8B400] flex items-center gap-2 mb-3">
        <Icon size={14} /> {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

export function VisitorProfileDrawer({ visitor, loading, onClose }: VisitorProfileDrawerProps) {
  if (!visitor && !loading) return null;

  const DeviceIcon = deviceIcon(visitor?.deviceType);

  const copyId = async () => {
    if (!visitor?.visitorId) return;
    try {
      await navigator.clipboard.writeText(visitor.visitorId);
    } catch {
      /* ignore */
    }
  };

  const exportJson = () => {
    if (!visitor) return;
    const blob = new Blob([JSON.stringify(visitor, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitor-${visitor.visitorId || "profile"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageViews = visitor?.pageViews || [];
  const location = [visitor?.city, visitor?.region, visitor?.country].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close profile"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-profile-title"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[#121217] shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 p-5 border-b border-white/10 bg-white/[0.03] shrink-0 rounded-t-2xl">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F8B400] mb-1">
              Visitor Profile
            </p>
            <h3
              id="visitor-profile-title"
              className="text-base sm:text-lg font-bold text-white truncate font-mono"
            >
              {visitor?.visitorId || (loading ? "Loading…" : "Unknown")}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {visitor?.date ? `Day ${visitor.date}` : null}
              {visitor?.daysSeen ? ` · ${visitor.daysSeen} day(s) seen` : null}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={copyId}
              title="Copy Visitor ID"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={exportJson}
              title="Export JSON"
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <Download size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 space-y-4">
          {loading && !visitor ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
              ))}
            </div>
          ) : visitor ? (
            <>
              <Section title="Identity" icon={Fingerprint}>
                <Row label="Visitor ID" value={visitor.visitorId || "—"} />
                <Row label="Session ID" value={visitor.sessionId || "—"} />
                <Row label="First visit" value={fmtTime(visitor.firstVisit || visitor.time)} />
                <Row label="Last visit" value={fmtTime(visitor.lastVisit || visitor.time)} />
                <Row label="Visit count" value={visitor.visitCount ?? 1} />
                <Row label="Page views" value={visitor.pageViewCount ?? (pageViews.length || 1)} />
              </Section>

              <Section title="Device" icon={DeviceIcon}>
                <Row
                  label="Type"
                  value={
                    <span className="inline-flex items-center gap-1.5 capitalize">
                      <DeviceIcon size={14} className="text-[#F8B400]" />
                      {visitor.deviceType || "unknown"}
                    </span>
                  }
                />
                <Row
                  label="Browser"
                  value={
                    [visitor.browser, visitor.browserVersion].filter(Boolean).join(" ") || "—"
                  }
                />
                <Row
                  label="OS"
                  value={[visitor.os, visitor.osVersion].filter(Boolean).join(" ") || "—"}
                />
                <Row label="User agent" value={visitor.userAgent || "—"} />
              </Section>

              <Section title="Network" icon={Wifi}>
                <Row label="IP (masked)" value={visitor.ip || "—"} />
              </Section>

              <Section title="Location" icon={MapPin}>
                <Row label="Place" value={location || "—"} />
                <Row label="Timezone" value={visitor.timezone || "—"} />
                <Row label="Language" value={visitor.language || "—"} />
              </Section>

              <Section title="Display" icon={Monitor}>
                <Row
                  label="Screen"
                  value={
                    visitor.screenWidth && visitor.screenHeight
                      ? `${visitor.screenWidth}×${visitor.screenHeight}`
                      : "—"
                  }
                />
                <Row
                  label="Viewport"
                  value={
                    visitor.viewportWidth && visitor.viewportHeight
                      ? `${visitor.viewportWidth}×${visitor.viewportHeight}`
                      : "—"
                  }
                />
                <Row
                  label="Pixel ratio"
                  value={visitor.devicePixelRatio != null ? visitor.devicePixelRatio : "—"}
                />
              </Section>

              <Section title="Capabilities" icon={Cookie}>
                <Row
                  label="Cookies"
                  value={
                    visitor.cookiesEnabled == null
                      ? "—"
                      : visitor.cookiesEnabled
                        ? "Enabled"
                        : "Disabled"
                  }
                />
                <Row
                  label="Touch"
                  value={
                    visitor.touchSupport == null ? "—" : visitor.touchSupport ? "Yes" : "No"
                  }
                />
                <Row
                  label="Online"
                  value={
                    visitor.onlineStatus == null ? "—" : visitor.onlineStatus ? "Online" : "Offline"
                  }
                />
                <Row
                  label="Language"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <Languages size={12} /> {visitor.language || "—"}
                    </span>
                  }
                />
              </Section>

              <Section title="Performance" icon={Gauge}>
                <Row label="Page load" value={fmtMs(visitor.pageLoad)} />
                <Row label="FCP" value={fmtMs(visitor.fcp)} />
                <Row label="LCP" value={fmtMs(visitor.lcp)} />
              </Section>

              <Section title="Traffic source" icon={Link2}>
                <Row label="Referrer" value={visitor.referrer || "Direct / none"} />
                <Row label="UTM source" value={visitor.utmSource || "—"} />
                <Row label="UTM medium" value={visitor.utmMedium || "—"} />
                <Row label="UTM campaign" value={visitor.utmCampaign || "—"} />
                <Row label="UTM term" value={visitor.utmTerm || "—"} />
                <Row label="UTM content" value={visitor.utmContent || "—"} />
              </Section>

              <Section title="Navigation" icon={Globe}>
                <Row label="Landing" value={visitor.landingPage || visitor.path || "—"} />
                <Row label="Current" value={visitor.currentPage || visitor.path || "—"} />
              </Section>

              <Section title="Session timeline" icon={Clock}>
                {pageViews.length === 0 ? (
                  <p className="text-sm text-zinc-500 py-2">
                    No page-view events stored yet for this visitor day.
                  </p>
                ) : (
                  <ol className="relative border-l border-white/10 ml-2 space-y-3 pl-4">
                    {pageViews.map((pv, idx) => (
                      <li key={`${pv.path}-${idx}`} className="relative">
                        <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F8B400]" />
                        <p className="text-sm text-zinc-200 font-medium truncate">{pv.path || "/"}</p>
                        {pv.title ? (
                          <p className="text-[11px] text-zinc-500 truncate">{pv.title}</p>
                        ) : null}
                        <p className="text-[11px] text-zinc-500">{fmtTime(pv.timestamp)}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </Section>

              <Section title="Behaviour events" icon={Eye}>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-dashed border-white/10 p-3 text-center">
                    <ScrollText size={16} className="mx-auto text-zinc-600 mb-1" />
                    <p className="text-[11px] text-zinc-500">Scroll depth</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Coming soon</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-white/10 p-3 text-center">
                    <MousePointerClick size={16} className="mx-auto text-zinc-600 mb-1" />
                    <p className="text-[11px] text-zinc-500">Clicks</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Coming soon</p>
                  </div>
                </div>
              </Section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
