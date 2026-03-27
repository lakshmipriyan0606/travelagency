/** Max raw samples to keep (~7d at 3s poll ≈ 200k; cap for localStorage safety) */
const MAX_RAW_POINTS = 120_000;
const STORAGE_KEY = "metrics_dashboard_history_v1";

export type MetricsRange = "day" | "month" | "year";

export interface MetricsSample {
  t: number;
  heapUsed: number;
  heapTotal: number;
  cpu: number;
  requests: number;
  requestsDelta: number;
}

export interface ChartPoint extends MetricsSample {
  timeLabel: string;
}

function loadStored(): MetricsSample[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { points?: MetricsSample[] };
    if (!parsed?.points || !Array.isArray(parsed.points)) return [];
    return parsed.points.filter(
      (p) =>
        typeof p.t === "number" &&
        typeof p.heapUsed === "number" &&
        typeof p.cpu === "number" &&
        typeof p.requests === "number"
    );
  } catch {
    return [];
  }
}

export function persistSamples(points: MetricsSample[]) {
  try {
    const pruned = points
      .sort((a, b) => a.t - b.t)
      .slice(-MAX_RAW_POINTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, points: pruned }));
  } catch {
    /* quota */
  }
}

export function mergeSample(prev: MetricsSample[], sample: MetricsSample): MetricsSample[] {
  const next = [...prev, sample].sort((a, b) => a.t - b.t);
  return next.slice(-MAX_RAW_POINTS);
}

export function getInitialHistory(): MetricsSample[] {
  return loadStored();
}

function windowMs(range: MetricsRange): number {
  switch (range) {
    case "day":
      return 24 * 60 * 60 * 1000;
    case "month":
      return 30 * 24 * 60 * 60 * 1000;
    case "year":
      return 365 * 24 * 60 * 60 * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

function formatLabel(t: number, range: MetricsRange): string {
  const d = new Date(t);
  switch (range) {
    case "day":
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "month":
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "year":
      return d.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric" });
    default:
      return d.toLocaleString();
  }
}

/** Bucket one point per calendar day (for year view) */
function bucketByDay(points: MetricsSample[]): MetricsSample[] {
  const byDay = new Map<string, MetricsSample[]>();
  for (const p of points) {
    const key = new Date(p.t).toISOString().slice(0, 10);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(p);
  }
  const keys = [...byDay.keys()].sort();
  return keys.map((key) => {
    const samples = byDay.get(key)!;
    const n = samples.length;
    const heapUsed = samples.reduce((s, x) => s + x.heapUsed, 0) / n;
    const heapTotal = samples.reduce((s, x) => s + x.heapTotal, 0) / n;
    const cpu = samples.reduce((s, x) => s + x.cpu, 0) / n;
    const last = samples[samples.length - 1];
    const [y, mo, d] = key.split("-").map(Number);
    const t = new Date(y, mo - 1, d).getTime();
    return {
      t,
      heapUsed: Number(heapUsed.toFixed(1)),
      heapTotal: Number(heapTotal.toFixed(1)),
      cpu: Number(cpu.toFixed(2)),
      requests: last.requests,
      requestsDelta: 0,
    };
  });
}

/** Evenly reduce to maxPoints */
function downsample(points: MetricsSample[], maxPoints: number): MetricsSample[] {
  if (points.length <= maxPoints) return points;
  const out: MetricsSample[] = [];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round(i * step);
    out.push(points[Math.min(idx, points.length - 1)]);
  }
  return out;
}

const MAX_CHART_POINTS = 320;

/**
 * Build chart rows for the selected range using absolute timestamps.
 */
export function buildChartData(points: MetricsSample[], range: MetricsRange): ChartPoint[] {
  const now = Date.now();
  const start = now - windowMs(range);
  let filtered = points.filter((p) => p.t >= start && p.t <= now);

  if (filtered.length === 0) return [];

  if (range === "year") {
    filtered = bucketByDay(filtered);
  } else if (filtered.length > MAX_CHART_POINTS) {
    filtered = downsample(filtered, MAX_CHART_POINTS);
  }

  return filtered.map((p) => ({
    ...p,
    timeLabel: formatLabel(p.t, range),
  }));
}

export function rangeTitle(range: MetricsRange): string {
  switch (range) {
    case "day":
      return "Last 24 hours";
    case "month":
      return "Last 30 days";
    case "year":
      return "Last 12 months";
    default:
      return "";
  }
}
