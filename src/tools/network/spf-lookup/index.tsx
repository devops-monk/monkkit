"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const QUALIFIER_COLOR: Record<string, string> = {
  "+": "text-green-600 bg-green-500/10",
  "-": "text-red-500 bg-red-500/10",
  "~": "text-yellow-600 bg-yellow-500/10",
  "?": "text-muted-foreground bg-muted",
};

export default function SpfLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
    setLoading(false);
  };

  const SAMPLES = ["google.com", "github.com", "microsoft.com"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. example.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setDomain(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw SPF Record</p>
              <CopyButton value={result.record!} />
            </div>
            <code className="text-sm font-mono break-all text-muted-foreground">{result.record}</code>
            {result.redirect && (
              <p className="text-xs text-blue-500 mt-2">Redirect → {result.redirect}</p>
            )}
          </div>
          {result.mechanisms && result.mechanisms.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mechanisms</p>
              {result.mechanisms.map((m, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${QUALIFIER_COLOR[m.qualifier]}`}>
                    {m.qualifier}{m.type}
                  </span>
                  <div className="min-w-0">
                    {m.value && <code className="text-xs font-mono text-muted-foreground">{m.value}</code>}
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
