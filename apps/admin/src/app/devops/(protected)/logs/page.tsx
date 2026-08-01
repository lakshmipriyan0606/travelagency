"use client";

import { useState } from "react";
import { devopsApi } from "@/features/devops/api";

export default function DevopsLogsPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<{
    requests: unknown[];
    errors: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await devopsApi.logsSearch(q);
      setResult((res as { data: { requests: unknown[]; errors: unknown[] } }).data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Log explorer</h1>
      <form onSubmit={(e) => void search(e)} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search route or error message…"
          className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#F8B400] text-zinc-950 font-bold px-5"
        >
          Search
        </button>
      </form>
      <pre className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-xs overflow-auto text-zinc-300 max-h-[70vh]">
        {result
          ? JSON.stringify(result, null, 2)
          : "Run a search to view request + error logs."}
      </pre>
    </div>
  );
}
