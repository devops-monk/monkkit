"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function TracerouteTool({ toolMeta: _ }: ToolComponentProps) {
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
          placeholder="Enter hostname or IP (e.g. google.com)" className="font-mono" />
        <Button onClick={run} disabled={!host.trim() || loading}>{loading ? "Tracing…" : "Trace"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setHost(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Trace is run from this server. May take up to 30 seconds.</p>
      {error && <ErrorDisplay message={error} />}
      {result && result.hops && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            TRACEROUTE — {result.host}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left pb-2 pr-4 w-8">Hop</th>
                  <th className="text-left pb-2 pr-4">Host</th>
                  <th className="text-right pb-2 pr-2">1</th>
                  <th className="text-right pb-2 pr-2">2</th>
                  <th className="text-right pb-2">3</th>
                </tr>
              </thead>
              <tbody>
                {result.hops.map((hop) => (
                  <tr key={hop.hop} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-4 text-muted-foreground">{hop.hop}</td>
                    <td className="py-1.5 pr-4 break-all">{hop.host === "*" ? <span className="text-muted-foreground/50">* * *</span> : hop.host}</td>
                    {hop.ms.map((ms, i) => (
                      <td key={i} className="py-1.5 pr-2 text-right text-xs">
                        {ms != null ? <span>{ms.toFixed(1)}<span className="text-muted-foreground">ms</span></span> : <span className="text-muted-foreground/50">*</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
