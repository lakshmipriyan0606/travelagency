"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  ExternalLink,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { ROUTES } from "@/lib/routes";

type Light = "green" | "yellow" | "red" | "unknown" | string;

type NocPayload = {
  overall: {
    status: string;
    light: Light;
    healthScore: number;
    availabilityPct: number;
    incidentCount: number;
    alertCount: number;
    openCriticalIssues: number;
    openErrors: number;
    answers: Record<string, unknown>;
  };
  applications: Array<{
    id: string;
    name: string;
    status: Light;
    version?: string | null;
    uptimeSec?: number | null;
    requests?: number | null;
    errors?: number | null;
    avgResponseMs?: number | null;
    note?: string;
    available?: boolean;
    reason?: string | null;
    connection?: string;
    memoryPct?: number | null;
    storagePct?: number | null;
  }>;
  infrastructure: Record<
    string,
    { light?: Light; pctUsed?: number | null; [k: string]: unknown }
  >;
  api: {
    totalRequestsToday: number;
    rps: number;
    rpm: number;
    successRate: number;
    errorRate: number;
    avgMs: number;
    p95Ms: number | null;
    p99Ms: number | null;
    timeouts: number;
    slowRequests: number;
    sampledNote?: string;
  };
  business: {
    bookingsToday: number;
    failedBookings: number;
    quotesToday: number;
    visitorsToday: number;
    trafficNormal: string;
    paymentsToday: { available: boolean; reason?: string };
    revenueToday: { available: boolean; reason?: string };
    topBusinessErrors: Array<{
      fingerprint: string;
      message: string;
      count: number;
      app: string;
    }>;
  };
  liveFeed: Array<{
    type: string;
    severity: string;
    title: string;
    service: string;
    ts: string;
  }>;
  incidents: Array<{
    id: string;
    incident: string;
    severity: string;
    affectedService: string;
    impact: string;
    started: string | null;
    owner: string;
    status: string;
    eta: string | null;
    recommendedAction?: string | null;
  }>;
  quickActions: Array<{
    id: string;
    label: string;
    kind: string;
    href?: string | null;
    enabled: boolean;
    reason?: string | null;
  }>;
  sla: {
    availabilityPct: number;
    latencyP95Ms: number | null;
    latencyP99Ms: number | null;
    errorBudgetRemainingPct: number;
    sloTargetPct: number;
    note?: string;
    monthlySla: { available: boolean; reason?: string };
    weeklySla: { available: boolean; reason?: string };
    burnRate: { available: boolean; reason?: string };
  };
  filters: { environment: string; region: string | null };
  meta: { collectedAt: string };
};

function lightClass(light: Light) {
  if (light === "green" || light === "healthy" || light === "up")
    return "bg-emerald-400 text-emerald-400";
  if (light === "yellow" || light === "degraded" || light === "warning")
    return "bg-amber-400 text-amber-400";
  if (light === "unknown") return "bg-zinc-500 text-zinc-500";
  return "bg-red-500 text-red-500";
}

function LightDot({ light }: { light: Light }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${lightClass(light).split(" ")[0]}`}
    />
  );
}

function fmtMs(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return `${Math.round(n)} ms`;
}

function fmtUptime(sec: number | null | undefined) {
  if (sec == null) return "—";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function AnswerChip({
  ok,
  label,
}: {
  ok: boolean | string;
  label: string;
}) {
  const good = ok === true || ok === "normal" || ok === "partial_bookings_ok_payments_unknown";
  const warn =
    ok === "partial_bookings_ok_payments_unknown" ||
    ok === "low" ||
    ok === "unknown";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
        good && !warn
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : warn
            ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
            : "border-red-500/30 bg-red-500/10 text-red-300"
      }`}
    >
      <LightDot
        light={good && !warn ? "green" : warn ? "yellow" : "red"}
      />
      {label}
    </span>
  );
}

export default function DevopsExecutivePage() {
  const [data, setData] = useState<NocPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await devopsApi.executive();
      setData((res as { data: NocPayload }).data);
      setError(null);
    } catch {
      setError("Failed to load operations center");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 15000);
    return () => clearInterval(t);
  }, [load]);

  if (error && !data) {
    return (
      <div className="space-y-3">
        <p className="text-red-400 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-xs font-bold text-[#F8B400]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <p className="text-zinc-500 text-sm">Loading operations center…</p>;
  }

  const o = data.overall;
  const a = data.api;
  const b = data.business;
  const answers = o.answers || {};

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* Header / overall — first 5 seconds */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-zinc-50 tracking-tight">
            Operations Center
          </h1>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {data.filters.environment}
            {data.filters.region ? ` · ${data.filters.region}` : ""} · Updated{" "}
            {new Date(data.meta.collectedAt).toLocaleTimeString()}
            {loading ? " · refreshing…" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-[#F8B400]/40"
        >
          <RefreshCw size={12} /> Health check
        </button>
      </div>

      <div
        className={`rounded-2xl border p-4 ${
          o.light === "green"
            ? "border-emerald-500/30 bg-emerald-500/5"
            : o.light === "yellow"
              ? "border-amber-500/30 bg-amber-500/5"
              : o.light === "red"
                ? "border-red-500/40 bg-red-500/10"
                : "border-zinc-800 bg-zinc-950/60"
        }`}
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <LightDot light={o.light} />
            <span className="text-2xl font-black text-zinc-50">{o.status}</span>
          </div>
          <div className="text-sm text-zinc-400">
            Score{" "}
            <span className="text-zinc-100 font-black text-lg">
              {o.healthScore}
            </span>
            <span className="text-zinc-600"> / 100</span>
          </div>
          <div className="text-sm text-zinc-400">
            Availability{" "}
            <span className="text-zinc-100 font-bold">
              {o.availabilityPct}%
            </span>
          </div>
          <div className="text-sm text-zinc-400">
            Incidents{" "}
            <span className="text-zinc-100 font-bold">{o.incidentCount}</span>
          </div>
          <div className="text-sm text-zinc-400">
            Alerts{" "}
            <span className="text-zinc-100 font-bold">{o.alertCount}</span>
          </div>
          <div className="text-sm text-zinc-400">
            Critical{" "}
            <span
              className={`font-bold ${o.openCriticalIssues ? "text-red-400" : "text-zinc-100"}`}
            >
              {o.openCriticalIssues}
            </span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <AnswerChip ok={answers.productionHealthy as boolean} label="Production" />
          <AnswerChip
            ok={
              Array.isArray(answers.appsWithProblems) &&
              (answers.appsWithProblems as string[]).length === 0
            }
            label="Apps"
          />
          <AnswerChip
            ok={answers.infrastructureHealthy as boolean}
            label="Infra"
          />
          <AnswerChip ok={answers.apisHealthy as boolean} label="APIs" />
          <AnswerChip ok={answers.databaseHealthy as boolean} label="Mongo" />
          <AnswerChip ok={answers.redisHealthy as boolean} label="Redis" />
          <AnswerChip ok={answers.queuesHealthy as boolean} label="Queues" />
          <AnswerChip
            ok={answers.bookingsPaymentsWorking as boolean | string}
            label="Bookings"
          />
          <AnswerChip
            ok={
              answers.customerTrafficNormal === "normal"
                ? true
                : answers.customerTrafficNormal === "low"
                  ? "low"
                  : false
            }
            label="Traffic"
          />
          <AnswerChip
            ok={!(answers.criticalAlertActive as boolean)}
            label="No critical"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left column — apps + infra + api + business */}
        <div className="xl:col-span-8 space-y-4">
          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Applications
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {data.applications.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-zinc-200 truncate">
                      {app.name}
                    </p>
                    <LightDot light={app.status} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-zinc-500">
                    <span>Req {app.requests ?? "—"}</span>
                    <span>Err {app.errors ?? "—"}</span>
                    <span>Avg {fmtMs(app.avgResponseMs)}</span>
                    <span>Up {fmtUptime(app.uptimeSec)}</span>
                    {app.storagePct != null && (
                      <span>Store {app.storagePct}%</span>
                    )}
                    {app.memoryPct != null && <span>Mem {app.memoryPct}%</span>}
                    {app.available === false && (
                      <span className="col-span-2 text-amber-500/80">
                        {app.reason || "Unavailable"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Infrastructure
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Object.entries(data.infrastructure).map(([key, val]) => (
                <div
                  key={key}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-2.5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase text-zinc-400">
                      {key}
                    </p>
                    <LightDot light={(val.light as Light) || "unknown"} />
                  </div>
                  <p className="text-sm font-black text-zinc-100 mt-1">
                    {val.pctUsed != null
                      ? `${val.pctUsed}%`
                      : val.available === false
                        ? "n/a"
                        : "ok"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                <Activity size={12} className="text-[#F8B400]" /> API (15m samples)
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-500">Today req</p>
                  <p className="font-black text-zinc-100">{a.totalRequestsToday}</p>
                </div>
                <div>
                  <p className="text-zinc-500">RPS / RPM</p>
                  <p className="font-black text-zinc-100">
                    {a.rps} / {a.rpm}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Success</p>
                  <p className="font-black text-emerald-300">{a.successRate}%</p>
                </div>
                <div>
                  <p className="text-zinc-500">Error</p>
                  <p className="font-black text-red-300">{a.errorRate}%</p>
                </div>
                <div>
                  <p className="text-zinc-500">P95 / P99</p>
                  <p className="font-black text-zinc-100">
                    {fmtMs(a.p95Ms)} / {fmtMs(a.p99Ms)}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">Slow / Timeout</p>
                  <p className="font-black text-zinc-100">
                    {a.slowRequests} / {a.timeouts}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                <Zap size={12} className="text-[#F8B400]" /> Business health
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-zinc-500">Bookings today</p>
                  <p className="font-black text-zinc-100">{b.bookingsToday}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Failed bookings</p>
                  <p className="font-black text-zinc-100">{b.failedBookings}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Quotes today</p>
                  <p className="font-black text-zinc-100">{b.quotesToday}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Visitors</p>
                  <p className="font-black text-zinc-100">{b.visitorsToday}</p>
                </div>
                <div className="col-span-2 text-[10px] text-zinc-500">
                  Payments / revenue:{" "}
                  {b.paymentsToday.available
                    ? "ok"
                    : b.paymentsToday.reason || "unavailable"}
                </div>
              </div>
              {b.topBusinessErrors?.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {b.topBusinessErrors.slice(0, 3).map((e) => (
                    <li
                      key={e.fingerprint}
                      className="text-[10px] text-red-300/90 truncate"
                    >
                      [{e.count}×] {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              SLA / SLO (sample-based)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-zinc-500">Availability</p>
                <p className="font-black">{data.sla.availabilityPct}%</p>
              </div>
              <div>
                <p className="text-zinc-500">Latency P95</p>
                <p className="font-black">{fmtMs(data.sla.latencyP95Ms)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Error budget vs {data.sla.sloTargetPct}%</p>
                <p className="font-black">
                  {data.sla.errorBudgetRemainingPct} pts
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Burn / monthly</p>
                <p className="font-black text-zinc-500 text-[10px]">
                  {data.sla.burnRate.reason || "n/a"}
                </p>
              </div>
            </div>
            {data.sla.note && (
              <p className="mt-2 text-[10px] text-zinc-600">{data.sla.note}</p>
            )}
          </section>
        </div>

        {/* Right column — incidents, feed, actions */}
        <div className="xl:col-span-4 space-y-4">
          <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-red-300 mb-2 flex items-center gap-1">
              <AlertTriangle size={12} /> Critical incident panel
            </h2>
            {data.incidents.length === 0 ? (
              <p className="text-xs text-emerald-300/90 flex items-center gap-1">
                <CheckCircle2 size={12} /> No open critical/high incidents
              </p>
            ) : (
              <ul className="space-y-2 max-h-56 overflow-y-auto">
                {data.incidents.slice(0, 8).map((inc) => (
                  <li
                    key={inc.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold text-zinc-100 truncate">
                        {inc.incident}
                      </p>
                      <span
                        className={`text-[9px] font-black uppercase ${
                          inc.severity === "critical"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {inc.affectedService} · {inc.owner} · {inc.status}
                    </p>
                    {inc.impact && (
                      <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">
                        {inc.impact}
                      </p>
                    )}
                    {inc.eta && (
                      <p className="text-[10px] text-[#F8B400]/80 mt-0.5">
                        ETA: {inc.eta}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Live activity
            </h2>
            <ul className="space-y-1.5 max-h-52 overflow-y-auto">
              {data.liveFeed.length === 0 ? (
                <li className="text-xs text-zinc-600">No recent events</li>
              ) : (
                data.liveFeed.slice(0, 12).map((ev, i) => (
                  <li
                    key={`${ev.ts}-${i}`}
                    className="text-[10px] text-zinc-400 border-b border-zinc-900 pb-1"
                  >
                    <span className="text-zinc-600">
                      {ev.ts ? new Date(ev.ts).toLocaleTimeString() : "—"}
                    </span>{" "}
                    <span className="text-[#F8B400]/80 uppercase">
                      {ev.type}
                    </span>{" "}
                    <span className="text-zinc-200">{ev.title}</span>
                    <span className="text-zinc-600"> · {ev.service}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
              <Server size={12} /> Quick actions
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {data.quickActions.map((qa) => {
                if (!qa.enabled) {
                  return (
                    <span
                      key={qa.id}
                      title={qa.reason || "Disabled"}
                      className="rounded-lg border border-zinc-800 px-2 py-1 text-[10px] text-zinc-600 cursor-not-allowed"
                    >
                      {qa.label}
                    </span>
                  );
                }
                if (qa.kind === "refresh") {
                  return (
                    <button
                      key={qa.id}
                      type="button"
                      onClick={() => void load()}
                      className="rounded-lg border border-[#F8B400]/40 bg-[#F8B400]/10 px-2 py-1 text-[10px] font-bold text-[#F8B400]"
                    >
                      {qa.label}
                    </button>
                  );
                }
                if (qa.kind === "external" && qa.href) {
                  return (
                    <a
                      key={qa.id}
                      href={qa.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1 text-[10px] font-bold text-zinc-300 hover:border-[#F8B400]/40"
                    >
                      {qa.label} <ExternalLink size={10} />
                    </a>
                  );
                }
                if (qa.href) {
                  return (
                    <Link
                      key={qa.id}
                      href={qa.href}
                      className="rounded-lg border border-zinc-700 px-2 py-1 text-[10px] font-bold text-zinc-300 hover:border-[#F8B400]/40"
                    >
                      {qa.label}
                    </Link>
                  );
                }
                return null;
              })}
            </div>
            <div className="mt-2 flex gap-2 text-[10px]">
              <Link
                href={ROUTES.devops.capacity}
                className="text-[#F8B400] font-bold inline-flex items-center gap-1"
              >
                <Database size={10} /> Capacity detail
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
