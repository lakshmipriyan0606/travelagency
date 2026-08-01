"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { devopsApi } from "@/features/devops/api";
import { severityColor, Unavailable } from "@/features/devops/format";

type Err = {
  fingerprint: string;
  message: string;
  count: number;
  occurrences?: number;
  status: string;
  firstSeenAt?: string;
  lastSeenAt: string;
  app: string;
  source: string;
  category?: string;
  taxonomy?: string;
  severity?: string;
  sentryEventId?: string | null;
  sentryUrl?: string | null;
  sentryLinkAvailable?: boolean;
  sentryLinkReason?: string | null;
  stackTop?: string;
  sample?: { route?: string; method?: string; statusCode?: number; requestId?: string };
};

export default function DevopsErrorsPage() {
  const [status, setStatus] = useState("open");
  const [items, setItems] = useState<Err[]>([]);
  const [selected, setSelected] = useState<Err | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await devopsApi.errors({ status });
    const data = (res as { data: { items?: Err[]; taxonomyNote?: string } | Err[] })
      .data;
    if (Array.isArray(data)) {
      setItems(data);
      setNote(null);
    } else {
      setItems(data?.items || []);
      setNote(data?.taxonomyNote || null);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setErrStatus(fp: string, next: string) {
    await devopsApi.patchError(fp, next);
    setSelected(null);
    await load();
  }

  async function openDetail(fp: string) {
    try {
      const res = (await devopsApi.errorDetail(fp)) as { data: Err };
      setSelected(res.data);
    } catch {
      const local = items.find((i) => i.fingerprint === fp);
      if (local) setSelected(local);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Error intelligence</h1>
          {note && <p className="text-xs text-zinc-500 mt-1">{note}</p>}
        </div>
        <div className="flex gap-1">
          {["open", "ack", "resolved", "all"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`text-[11px] px-2.5 py-1 rounded-md border ${
                status === s
                  ? "border-[#F8B400]/60 text-[#F8B400]"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((e) => (
          <div
            key={e.fingerprint}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button
                type="button"
                className="text-left min-w-0 flex-1"
                onClick={() => void openDetail(e.fingerprint)}
              >
                <p className="font-semibold text-zinc-100">{e.message}</p>
                <p className="text-xs text-zinc-500 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                  <span className={severityColor(e.severity)}>
                    {e.severity || "—"}
                  </span>
                  <span>{e.category || e.taxonomy || "—"}</span>
                  <span>
                    {e.app} · {e.source}
                  </span>
                  <span>×{e.occurrences ?? e.count}</span>
                  <span>
                    first{" "}
                    {e.firstSeenAt
                      ? new Date(e.firstSeenAt).toLocaleString()
                      : "—"}
                  </span>
                  <span>
                    last {new Date(e.lastSeenAt).toLocaleString()}
                  </span>
                </p>
                <p className="text-[10px] font-mono text-zinc-600 mt-1 truncate">
                  {e.fingerprint}
                </p>
              </button>
              <div className="flex flex-wrap gap-2 items-center">
                {e.sentryUrl ? (
                  <a
                    href={e.sentryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg border border-sky-700/50 text-sky-300 inline-flex items-center gap-1"
                  >
                    Sentry <ExternalLink size={11} />
                  </a>
                ) : null}
                {e.status === "open" && (
                  <button
                    type="button"
                    onClick={() => void setErrStatus(e.fingerprint, "ack")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-amber-500/50"
                  >
                    Ack
                  </button>
                )}
                {e.status !== "resolved" && (
                  <button
                    type="button"
                    onClick={() =>
                      void setErrStatus(e.fingerprint, "resolved")
                    }
                    className="text-xs px-3 py-1.5 rounded-lg border border-emerald-700/50 text-emerald-300"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
            {!e.sentryLinkAvailable && e.sentryLinkReason && (
              <p className="text-[10px] text-zinc-600 mt-2">
                Sentry: {e.sentryLinkReason}
              </p>
            )}
          </div>
        ))}
        {!items.length && (
          <p className="text-sm text-zinc-500">No errors for this filter.</p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold">Error detail</h2>
              <button
                type="button"
                className="text-zinc-500 text-sm"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <p className="text-zinc-100 font-medium">{selected.message}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-zinc-500">Severity</dt>
                <dd className={severityColor(selected.severity)}>
                  {selected.severity}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Category</dt>
                <dd>{selected.category || selected.taxonomy}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Occurrences</dt>
                <dd>{selected.occurrences ?? selected.count}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Status</dt>
                <dd>{selected.status}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">First seen</dt>
                <dd>
                  {selected.firstSeenAt
                    ? new Date(selected.firstSeenAt).toLocaleString()
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Last seen</dt>
                <dd>{new Date(selected.lastSeenAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Route</dt>
                <dd className="font-mono">
                  {selected.sample?.method} {selected.sample?.route || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Request ID</dt>
                <dd className="font-mono">
                  {selected.sample?.requestId || "—"}
                </dd>
              </div>
            </dl>
            {selected.sentryUrl ? (
              <a
                href={selected.sentryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-sky-300"
              >
                Open in Sentry <ExternalLink size={12} />
              </a>
            ) : (
              <Unavailable reason={selected.sentryLinkReason} />
            )}
            {selected.stackTop && (
              <pre className="mt-4 text-[10px] text-zinc-400 bg-zinc-900 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">
                {selected.stackTop}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
