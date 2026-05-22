"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function HttpHeadersTool({ toolMeta: _ }: ToolComponentProps) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ url });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
    setLoading(false);
  };

  const riskColor = { pass: "text-green-600", warn: "text-yellow-600", fail: "text-red-600" };
  const riskBg = { pass: "bg-green-500/10", warn: "bg-yellow-500/10", fail: "bg-red-500/10" };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => { setUrl(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter URL (e.g. https://example.com)" className="font-mono" />
        <Button onClick={run} disabled={!url.trim() || loading}>{loading ? "Fetching…" : "Check"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold px-2 py-1 rounded font-mono ${result.status! < 300 ? "bg-green-500/10 text-green-600" : result.status! < 400 ? "bg-yellow-500/10 text-yellow-600" : "bg-red-500/10 text-red-600"}`}>
              {result.status} {result.statusText}
            </span>
            {result.duration && <span className="text-sm text-muted-foreground">{result.duration}ms</span>}
          </div>

          {result.securityHeaders && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Security Headers</p>
              {result.securityHeaders.map(({ header, present, value, risk }) => (
                <div key={header} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className={`text-xs font-bold w-10 text-center py-0.5 rounded shrink-0 ${riskBg[risk]} ${riskColor[risk]}`}>
                    {risk === "pass" ? "✓" : risk === "warn" ? "~" : "✗"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <code className="text-sm font-mono">{header}</code>
                    {value && <p className="text-xs text-muted-foreground mt-0.5 truncate">{value}</p>}
                    {!present && <p className="text-xs text-muted-foreground mt-0.5">Missing</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Headers</p>
              <CopyButton value={Object.entries(result.headers ?? {}).map(([k, v]) => `${k}: ${v}`).join("\n")} />
            </div>
            {Object.entries(result.headers ?? {}).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                <code className="text-xs font-mono text-blue-500 min-w-[180px] shrink-0">{key}</code>
                <code className="text-xs font-mono text-muted-foreground break-all">{value}</code>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
