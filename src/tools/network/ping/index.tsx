"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function PingTool({ toolMeta: _ }: ToolComponentProps) {
  const [host, setHost] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ host });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
    setLoading(false);
  };

  const SAMPLES = ["google.com", "cloudflare.com", "github.com"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={host} onChange={(e) => { setHost(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter hostname (e.g. google.com)" className="font-mono" />
        <Button onClick={run} disabled={!host.trim() || loading}>{loading ? "Pinging…" : "Ping"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setHost(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              PING {result.host} — 4 requests
            </p>
            <div className="flex flex-col gap-2 font-mono text-sm">
              {result.attempts?.map((a) => (
                <div key={a.seq} className={`flex items-center gap-2 ${a.error ? "text-red-500" : ""}`}>
                  <span className="text-muted-foreground">seq={a.seq}</span>
                  {a.ms !== null ? (
                    <span>time=<strong>{a.ms}ms</strong></span>
                  ) : (
                    <span className="text-muted-foreground/50">Request timeout</span>
                  )}
                  {a.error && !a.ms && <span className="text-xs text-red-500">{a.error}</span>}
                </div>
              ))}
            </div>
          </div>
          {result.stats && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Statistics</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  ["Sent", result.stats.sent],
                  ["Received", result.stats.received],
                  ["Loss", `${result.stats.loss}%`],
                  ["Min", result.stats.minMs != null ? `${result.stats.minMs}ms` : "—"],
                  ["Avg", result.stats.avgMs != null ? `${result.stats.avgMs}ms` : "—"],
                  ["Max", result.stats.maxMs != null ? `${result.stats.maxMs}ms` : "—"],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex flex-col items-center p-2 rounded bg-muted/40">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <strong className="text-sm font-mono">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
