"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Gauge, RefreshCw } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import {
  formatBytes,
  formatPct,
  healthColor,
  severityColor,
  Unavailable,
} from "@/features/devops/format";
import {
  AppStorageBarChart,
  CollectionsBarChart,
  ForecastTrendChart,
  SectionError,
  SectionSkeleton,
  UsageMeter,
} from "@/features/devops/capacityCharts";

type CapOverview = {
  overallHealth?: string;
  host?: { hostname?: string; platform?: string; note?: string };
  kpis?: Array<{
    id: string;
    label: string;
    health?: string;
    pctUsed?: number | null;
    usedBytes?: number | null;
    totalBytes?: number | null;
    freeBytes?: number | null;
    dataSize?: number | null;
    indexSize?: number | null;
    load1?: number | null;
    cores?: number | null;
    loadPerCore?: number | null;
    available?: boolean;
    reason?: string;
    note?: string;
    hostname?: string;
    dbName?: string;
    quotaKnown?: boolean;
    totals?: { total?: number; withFailureHistory?: number };
  }>;
  alertsSummary?: { critical: number; warning: number; total: number };
  collectedAt?: string;
  forecastAvailable?: boolean;
  forecastReason?: string | null;
};

type CollectionRow = {
  name: string;
  size?: number;
  storageSize?: number;
  count?: number;
  avgObjSize?: number;
  nindexes?: number;
  totalIndexSize?: number;
};

type SectionKey =
  | "overview"
  | "mongo"
  | "collections"
  | "disk"
  | "memory"
  | "forecast"
  | "alerts"
  | "apps"
  | "cloud";

type SectionErrors = Partial<Record<SectionKey, string>>;

function unwrapData<T>(payload: unknown): T | null {
  if (payload == null || typeof payload !== "object") return null;
  const obj = payload as Record<string, unknown>;
  if ("data" in obj) return (obj.data as T) ?? null;
  return payload as T;
}

function sectionFailMessage(reason: unknown): string {
  if (reason && typeof reason === "object" && "message" in reason) {
    const m = (reason as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) return m;
  }
  return "Request failed";
}

export default function DevopsCapacityPage() {
  const [overview, setOverview] = useState<CapOverview | null>(null);
  const [mongo, setMongo] = useState<Record<string, unknown> | null>(null);
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [collectionsMeta, setCollectionsMeta] = useState<{
    available?: boolean;
    reason?: string;
  } | null>(null);
  const [disk, setDisk] = useState<Record<string, unknown> | null>(null);
  const [memory, setMemory] = useState<Record<string, unknown> | null>(null);
  const [forecast, setForecast] = useState<Record<string, unknown> | null>(
    null
  );
  const [alerts, setAlerts] = useState<Array<Record<string, unknown>>>([]);
  const [apps, setApps] = useState<Record<string, unknown> | null>(null);
  const [cloud, setCloud] = useState<Record<string, unknown> | null>(null);
  const [sectionErrors, setSectionErrors] = useState<SectionErrors>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const loadedRef = useRef(false);

  const load = useCallback(async (fresh = false) => {
    if (loadedRef.current) setRefreshing(true);
    else setLoading(true);

    const jobs: Array<{
      key: SectionKey;
      run: () => Promise<unknown>;
      apply: (payload: unknown) => void;
    }> = [
      {
        key: "overview",
        run: () => devopsApi.capacityOverview(fresh),
        apply: (payload) => {
          setOverview(unwrapData<CapOverview>(payload));
        },
      },
      {
        key: "mongo",
        run: () => devopsApi.capacityMongodb(fresh),
        apply: (payload) => {
          setMongo(unwrapData<Record<string, unknown>>(payload));
        },
      },
      {
        key: "collections",
        run: () => devopsApi.capacityCollections(fresh),
        apply: (payload) => {
          const colData = unwrapData<{
            collections?: CollectionRow[];
            available?: boolean;
            reason?: string;
          }>(payload);
          const rows = [...(colData?.collections || [])].sort(
            (a, b) =>
              (b.storageSize || b.size || 0) - (a.storageSize || a.size || 0)
          );
          setCollections(rows);
          setCollectionsMeta({
            available: colData?.available,
            reason: colData?.reason,
          });
        },
      },
      {
        key: "disk",
        run: () => devopsApi.capacityDisk(fresh),
        apply: (payload) => {
          setDisk(unwrapData<Record<string, unknown>>(payload));
        },
      },
      {
        key: "memory",
        run: () => devopsApi.capacityMemory(fresh),
        apply: (payload) => {
          setMemory(unwrapData<Record<string, unknown>>(payload));
        },
      },
      {
        key: "forecast",
        run: () => devopsApi.capacityForecast(fresh),
        apply: (payload) => {
          setForecast(unwrapData<Record<string, unknown>>(payload));
        },
      },
      {
        key: "alerts",
        run: () => devopsApi.capacityAlerts(fresh),
        apply: (payload) => {
          const al = unwrapData<{ alerts?: Array<Record<string, unknown>> }>(
            payload
          );
          setAlerts(al?.alerts || []);
        },
      },
      {
        key: "apps",
        run: () => devopsApi.capacityApps(fresh),
        apply: (payload) => {
          setApps(unwrapData<Record<string, unknown>>(payload));
        },
      },
      {
        key: "cloud",
        run: () => devopsApi.capacityCloud(fresh),
        apply: (payload) => {
          setCloud(unwrapData<Record<string, unknown>>(payload));
        },
      },
    ];

    const settled = await Promise.allSettled(jobs.map((j) => j.run()));
    const nextErrors: SectionErrors = {};

    settled.forEach((result, i) => {
      const job = jobs[i];
      if (result.status === "fulfilled") {
        try {
          job.apply(result.value);
        } catch {
          nextErrors[job.key] = "Unexpected response shape";
        }
      } else {
        nextErrors[job.key] = sectionFailMessage(result.reason);
      }
    });

    setSectionErrors(nextErrors);
    loadedRef.current = true;
    setHasLoadedOnce(true);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const failedCount = Object.keys(sectionErrors).length;
  const allFailed = hasLoadedOnce && failedCount === 9;

  const memOs = (memory?.memory as { os?: Record<string, unknown> })?.os;
  const memNode = (memory?.memory as { node?: Record<string, unknown> })?.node;
  const memCpu = (memory?.memory as { cpu?: Record<string, unknown> })?.cpu;
  const redis = memory?.redis as Record<string, unknown> | undefined;
  const series =
    (forecast?.series as Array<{
      ts?: string;
      diskPct?: number | null;
      memPct?: number | null;
      mongoStorageSize?: number | null;
    }>) || [];
  const mongoApps =
    (apps?.mongo as {
      available?: boolean;
      reason?: string;
      note?: string;
      apps?: Record<
        string,
        {
          storageSize?: number;
          dataSize?: number;
          count?: number;
          note?: string;
        }
      >;
    }) || {};
  const fsRoot =
    (apps?.filesystem as {
      available?: boolean;
      reason?: string | null;
      filesystem?: Record<
        string,
        { available?: boolean; bytes?: number; reason?: string; path?: string }
      >;
    }) || {};
  const memoryNote = (memory?.memory as { note?: string } | undefined)?.note;

  const appChartRows = useMemo(() => {
    const order = ["b2c", "b2b", "admin", "backend", "other"];
    return order.map((app) => {
      const m = (mongoApps.apps || {})[app];
      return {
        app,
        storage: Number(m?.storageSize) || 0,
        data: Number(m?.dataSize) || 0,
        docs: Number(m?.count) || 0,
      };
    });
  }, [mongoApps.apps]);

  const collectionChartRows = useMemo(
    () =>
      collections.map((c) => ({
        name: c.name,
        storage: Number(c.storageSize ?? c.size) || 0,
      })),
    [collections]
  );

  if (loading && !hasLoadedOnce) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Gauge className="text-[#F8B400]" size={18} />
          <h1 className="text-xl font-black text-zinc-50">
            Infrastructure capacity
          </h1>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <SectionSkeleton rows={3} />
            </div>
          ))}
        </div>
        <p className="text-xs text-zinc-500">Loading capacity telemetry…</p>
      </div>
    );
  }

  if (allFailed) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Gauge className="text-[#F8B400]" size={18} />
            <h1 className="text-xl font-black text-zinc-50">
              Infrastructure capacity
            </h1>
          </div>
          <button
            type="button"
            onClick={() => void load(true)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
        <p className="text-red-400 text-sm">
          Failed to load capacity telemetry — all endpoints errored.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gauge className="text-[#F8B400]" size={18} />
          <div>
            <h1 className="text-xl font-black text-zinc-50">
              Infrastructure capacity
            </h1>
            <p className="text-xs text-zinc-500">
              Overall:{" "}
              <span className={healthColor(overview?.overallHealth)}>
                {overview?.overallHealth || "—"}
              </span>
              {overview?.collectedAt
                ? ` · ${new Date(overview.collectedAt).toLocaleString()}`
                : ""}
              {failedCount > 0
                ? ` · ${failedCount} section${failedCount === 1 ? "" : "s"} unavailable`
                : ""}
            </p>
            {overview?.host?.note ? (
              <p className="text-[10px] text-zinc-600 mt-1 max-w-xl">
                Host: {overview.host.hostname || "—"} ({overview.host.platform}
                ). {overview.host.note}
              </p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-100 disabled:opacity-50"
        >
          <RefreshCw
            size={12}
            className={refreshing ? "animate-spin" : undefined}
          />
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="space-y-2">
        <SectionError message={sectionErrors.overview} />
        {!overview && !sectionErrors.overview ? (
          <SectionSkeleton rows={2} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {(overview?.kpis || []).map((k) => (
              <div
                key={k.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  {k.label}
                </p>
                {k.available === false ? (
                  <div className="mt-2">
                    <p className="text-2xl font-black text-zinc-600">n/a</p>
                    <Unavailable reason={k.reason} />
                  </div>
                ) : (
                  <>
                    <p
                      className={`mt-2 text-2xl font-black ${healthColor(k.health)}`}
                    >
                      {k.pctUsed != null
                        ? formatPct(k.pctUsed)
                        : k.id === "mongo" && k.usedBytes != null
                          ? formatBytes(k.usedBytes)
                          : k.id === "cpu" && k.loadPerCore != null
                            ? `${k.loadPerCore}×`
                            : k.id === "queue"
                              ? String(
                                  (
                                    k.totals as
                                      | {
                                          totalJobs?: number;
                                          total?: number;
                                        }
                                      | undefined
                                  )?.totalJobs ??
                                    k.totals?.total ??
                                    "—"
                                )
                              : k.usedBytes != null
                                ? formatBytes(k.usedBytes)
                                : "—"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {k.id === "mongo"
                        ? [
                            k.dbName ? `db ${k.dbName}` : null,
                            k.dataSize != null
                              ? `data ${formatBytes(k.dataSize)}`
                              : null,
                            k.indexSize != null
                              ? `idx ${formatBytes(k.indexSize)}`
                              : null,
                            k.quotaKnown
                              ? `quota ${formatPct(k.pctUsed)}`
                              : "no FS quota from Mongo",
                          ]
                            .filter(Boolean)
                            .join(" · ")
                        : k.usedBytes != null && k.totalBytes != null
                          ? `${formatBytes(k.usedBytes)} / ${formatBytes(k.totalBytes)}`
                          : k.id === "cpu"
                            ? `load1 ${k.load1 ?? "—"} · ${k.cores ?? "?"} cores`
                            : k.id === "queue"
                              ? `failures ${(k.totals as { failedJobs?: number; withFailureHistory?: number } | undefined)?.failedJobs ?? (k.totals as { withFailureHistory?: number } | undefined)?.withFailureHistory ?? "—"}`
                              : k.note ||
                                k.reason ||
                                `Health: ${k.health || "—"}`}
                    </p>
                    {k.pctUsed != null ? (
                      <UsageMeter pct={k.pctUsed} health={k.health} />
                    ) : null}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application-wise storage */}
      <section className="rounded-2xl border border-[#F8B400]/25 bg-zinc-950/60 p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8B400]">
          Application-wise storage (Mongo + app folders)
        </h2>
        <p className="text-[10px] text-zinc-500">
          Mongo sizes are real collStats from the connected database. Folder
          sizes are source trees on the Node host (excludes node_modules/.next).
        </p>
        <SectionError message={sectionErrors.apps} />
        {sectionErrors.apps && !apps ? null : (
          <>
            {mongoApps.available === false ? (
              <Unavailable reason={mongoApps.reason} />
            ) : (
              <AppStorageBarChart rows={appChartRows} />
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="text-left py-2 pr-3">App</th>
                    <th className="text-right py-2 pr-3">Mongo storage</th>
                    <th className="text-right py-2 pr-3">Mongo data</th>
                    <th className="text-right py-2 pr-3">Docs</th>
                    <th className="text-right py-2">Folder on host</th>
                  </tr>
                </thead>
                <tbody>
                  {["b2c", "b2b", "admin", "backend", "other"].map((app) => {
                    const m = (mongoApps.apps || {})[app];
                    const fs = (fsRoot.filesystem || {})[app] as
                      | {
                          available?: boolean;
                          bytes?: number;
                          reason?: string;
                        }
                      | undefined;
                    return (
                      <tr key={app} className="border-b border-zinc-900/80">
                        <td className="py-2 pr-3 font-bold uppercase text-zinc-200">
                          {app}
                          {m?.note ? (
                            <span className="block font-normal normal-case text-[10px] text-zinc-600">
                              {m.note}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2 pr-3 text-right text-zinc-100">
                          {mongoApps.available === false
                            ? "—"
                            : formatBytes(m?.storageSize)}
                        </td>
                        <td className="py-2 pr-3 text-right text-zinc-400">
                          {mongoApps.available === false
                            ? "—"
                            : formatBytes(m?.dataSize)}
                        </td>
                        <td className="py-2 pr-3 text-right text-zinc-400">
                          {mongoApps.available === false
                            ? "—"
                            : (m?.count ?? "—")}
                        </td>
                        <td className="py-2 text-right text-zinc-400">
                          {app === "other"
                            ? "—"
                            : fs?.available === false
                              ? "n/a"
                              : formatBytes(fs?.bytes)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {mongoApps.note ? (
              <p className="text-[10px] text-zinc-600">{mongoApps.note}</p>
            ) : null}
            {fsRoot.available === false && fsRoot.reason ? (
              <Unavailable reason={fsRoot.reason} />
            ) : null}
          </>
        )}
      </section>

      {/* Disk + Mongo */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Host disk (Node process machine)
          </h2>
          <SectionError message={sectionErrors.disk} />
          {disk?.note ? (
            <p className="text-[10px] text-zinc-600">{String(disk.note)}</p>
          ) : null}
          {sectionErrors.disk && !disk ? null : disk?.available === false ? (
            <Unavailable reason={String(disk.reason || "")} />
          ) : disk ? (
            <>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-zinc-500 text-xs">Path</dt>
                  <dd className="font-mono text-xs truncate">
                    {String(disk?.path || "—")}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Used</dt>
                  <dd className={healthColor(String(disk?.health))}>
                    {formatPct(disk?.pctUsed as number)} ·{" "}
                    {formatBytes(disk?.usedBytes as number)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Free</dt>
                  <dd>{formatBytes(disk?.freeBytes as number)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Total</dt>
                  <dd>{formatBytes(disk?.totalBytes as number)}</dd>
                </div>
              </dl>
              <UsageMeter
                pct={disk?.pctUsed as number}
                health={String(disk?.health || "")}
                label="Utilization"
              />
            </>
          ) : (
            <SectionSkeleton />
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            MongoDB (application database)
          </h2>
          <SectionError message={sectionErrors.mongo} />
          {sectionErrors.mongo && !mongo ? null : mongo?.available ===
            false ? (
            <Unavailable reason={String(mongo.reason || "")} />
          ) : mongo ? (
            <>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-zinc-500 text-xs">Storage</dt>
                  <dd>{formatBytes(mongo?.storageSize as number)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Data</dt>
                  <dd>{formatBytes(mongo?.dataSize as number)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Index</dt>
                  <dd>{formatBytes(mongo?.indexSize as number)}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Storage + index</dt>
                  <dd className={healthColor(String(mongo?.health))}>
                    {formatBytes(
                      typeof mongo?.totalUsedBytes === "number"
                        ? (mongo.totalUsedBytes as number)
                        : typeof mongo?.storageSize === "number" ||
                            typeof mongo?.indexSize === "number"
                          ? (Number(mongo?.storageSize) || 0) +
                            (Number(mongo?.indexSize) || 0)
                          : null
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">FS quota</dt>
                  <dd>
                    {mongo?.quotaKnown
                      ? `${formatPct(mongo?.pctUsed as number)} of ${formatBytes(mongo?.fsTotalSize as number)}`
                      : "not reported (Atlas free/shared)"}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">
                    Collections / objects
                  </dt>
                  <dd>
                    {String(mongo?.collectionsCount ?? "—")} /{" "}
                    {String(mongo?.objects ?? "—")}
                  </dd>
                </div>
              </dl>
              {mongo?.quotaKnown ? (
                <UsageMeter
                  pct={mongo?.pctUsed as number}
                  health={String(mongo?.health || "")}
                  label="FS quota used"
                />
              ) : null}
            </>
          ) : (
            <SectionSkeleton />
          )}
          {mongo?.note ? (
            <p className="text-[10px] text-zinc-600">{String(mongo.note)}</p>
          ) : null}
        </section>
      </div>

      {/* Memory / Redis */}
      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Host RAM (Node process machine)
          </h2>
          <SectionError message={sectionErrors.memory} />
          {memoryNote ? (
            <p className="text-[10px] text-zinc-600">{memoryNote}</p>
          ) : null}
          {sectionErrors.memory && !memory ? null : memory ? (
            <>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-zinc-500 text-xs">OS RAM</dt>
                  <dd>
                    {formatPct(memOs?.usedPct as number)} ·{" "}
                    {formatBytes(memOs?.usedBytes as number)} /{" "}
                    {formatBytes(memOs?.totalBytes as number)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Node RSS / heap</dt>
                  <dd>
                    {formatBytes(memNode?.rss as number)} /{" "}
                    {formatBytes(memNode?.heapUsed as number)}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Load (1/5/15)</dt>
                  <dd>
                    {String(memCpu?.load1 ?? "—")} /{" "}
                    {String(memCpu?.load5 ?? "—")} /{" "}
                    {String(memCpu?.load15 ?? "—")}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Cores</dt>
                  <dd>{String(memCpu?.cores ?? "—")}</dd>
                </div>
              </dl>
              <UsageMeter
                pct={memOs?.usedPct as number}
                label="OS RAM utilization"
              />
            </>
          ) : (
            <SectionSkeleton />
          )}
        </section>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Redis
          </h2>
          <SectionError message={sectionErrors.memory} />
          {!memory && sectionErrors.memory ? null : redis?.available ===
            false ? (
            <Unavailable reason={String(redis.reason || "")} />
          ) : redis ? (
            <>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-zinc-500 text-xs">Used</dt>
                  <dd className={healthColor(String(redis?.health))}>
                    {formatBytes(redis?.usedMemory as number)}
                    {redis?.pctUsed != null
                      ? ` · ${formatPct(redis.pctUsed as number)}`
                      : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500 text-xs">Limit</dt>
                  <dd>
                    {formatBytes(
                      (redis?.maxMemory as number) ||
                        (redis?.totalSystemMemory as number)
                    )}
                  </dd>
                </div>
              </dl>
              {redis?.pctUsed != null ? (
                <UsageMeter
                  pct={redis.pctUsed as number}
                  health={String(redis?.health || "")}
                  label="Memory limit used"
                />
              ) : null}
            </>
          ) : memory ? (
            <Unavailable reason="Redis metrics not present in memory payload" />
          ) : (
            <SectionSkeleton />
          )}
          {redis?.note ? (
            <p className="text-[10px] text-zinc-600">{String(redis.note)}</p>
          ) : null}
        </section>
      </div>

      {/* Collections chart + table */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Top collections by storage
        </h2>
        <SectionError message={sectionErrors.collections} />
        {collectionsMeta?.available === false ? (
          <Unavailable reason={collectionsMeta.reason} />
        ) : !collections.length && !sectionErrors.collections ? (
          <p className="text-xs text-zinc-500 italic">No collection stats</p>
        ) : collections.length ? (
          <>
            <CollectionsBarChart rows={collectionChartRows} topN={10} />
            <div className="overflow-x-auto max-h-72 rounded-xl border border-zinc-800/80">
              <table className="w-full text-xs">
                <thead className="text-zinc-500 sticky top-0 bg-zinc-950">
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3">Name</th>
                    <th className="text-right p-3">Docs</th>
                    <th className="text-right p-3">Storage</th>
                    <th className="text-right p-3">Data</th>
                    <th className="text-right p-3">Indexes</th>
                    <th className="text-right p-3">Index size</th>
                  </tr>
                </thead>
                <tbody>
                  {collections.slice(0, 40).map((c) => (
                    <tr
                      key={c.name}
                      className="border-b border-zinc-900 text-zinc-300"
                    >
                      <td className="p-3 font-mono">{c.name}</td>
                      <td className="p-3 text-right">{c.count ?? "—"}</td>
                      <td className="p-3 text-right">
                        {formatBytes(c.storageSize ?? c.size)}
                      </td>
                      <td className="p-3 text-right">{formatBytes(c.size)}</td>
                      <td className="p-3 text-right">{c.nindexes ?? "—"}</td>
                      <td className="p-3 text-right">
                        {formatBytes(c.totalIndexSize)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </section>

      {/* Forecast chart */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Forecast / growth series
        </h2>
        <SectionError message={sectionErrors.forecast} />
        {forecast?.available === false ? (
          <Unavailable
            reason={String(
              forecast.reason || overview?.forecastReason || ""
            )}
          />
        ) : series.length > 0 ? (
          <ForecastTrendChart series={series} />
        ) : sectionErrors.forecast && !forecast ? null : (
          <Unavailable reason="No snapshot series yet — history accumulates over time" />
        )}
        <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-zinc-400">
          <p>
            Disk days-until-full:{" "}
            {String(
              (forecast?.disk as { daysUntilFull?: number | null })
                ?.daysUntilFull ?? "n/a"
            )}
          </p>
          <p>
            Mongo days-until-full:{" "}
            {String(
              (forecast?.mongo as { daysUntilFull?: number | null })
                ?.daysUntilFull ?? "n/a"
            )}
          </p>
        </div>
        {(forecast?.mongo as { note?: string } | undefined)?.note ? (
          <p className="text-[10px] text-zinc-600">
            {String((forecast?.mongo as { note?: string }).note)}
          </p>
        ) : null}
      </section>

      {/* Alerts */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Capacity alerts ({overview?.alertsSummary?.total ?? alerts.length})
        </h2>
        <SectionError message={sectionErrors.alerts} />
        {!alerts.length && !sectionErrors.alerts ? (
          <p className="text-sm text-zinc-500">No capacity threshold alerts</p>
        ) : alerts.length ? (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={String(a.id)}
                className="rounded-xl border border-zinc-800/80 p-3 text-sm"
              >
                <p className={`font-semibold ${severityColor(String(a.severity))}`}>
                  {String(a.severity).toUpperCase()} · {String(a.resource)}
                </p>
                <p className="text-zinc-300 mt-1">{String(a.cause)}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Impact: {String(a.impact)}
                </p>
                <p className="text-xs text-zinc-500">
                  Action: {String(a.action)}
                  {a.eta ? ` · ETA: ${String(a.eta)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Cloud */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Cloud storage
        </h2>
        <SectionError message={sectionErrors.cloud} />
        {sectionErrors.cloud && !cloud ? null : cloud?.available === false ? (
          <Unavailable reason={String(cloud.reason || "")} />
        ) : cloud ? (
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            <div>
              <dt className="text-zinc-500 text-xs">Provider</dt>
              <dd>{String(cloud?.provider || "cloudinary")}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Plan</dt>
              <dd>{String(cloud?.plan || "—")}</dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Storage</dt>
              <dd>
                {cloud?.storage
                  ? typeof cloud.storage === "object"
                    ? JSON.stringify(cloud.storage).slice(0, 80)
                    : String(cloud.storage)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Bandwidth</dt>
              <dd>
                {cloud?.bandwidth
                  ? typeof cloud.bandwidth === "object"
                    ? JSON.stringify(cloud.bandwidth).slice(0, 80)
                    : String(cloud.bandwidth)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Objects</dt>
              <dd>
                {cloud?.objects
                  ? typeof cloud.objects === "object"
                    ? JSON.stringify(cloud.objects).slice(0, 80)
                    : String(cloud.objects)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500 text-xs">Credits</dt>
              <dd>
                {cloud?.credits
                  ? typeof cloud.credits === "object"
                    ? JSON.stringify(cloud.credits).slice(0, 80)
                    : String(cloud.credits)
                  : "—"}
              </dd>
            </div>
          </dl>
        ) : (
          <SectionSkeleton />
        )}
      </section>
    </div>
  );
}
