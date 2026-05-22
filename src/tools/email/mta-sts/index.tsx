"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function MtaStsTool({ toolMeta: _ }: ToolComponentProps) {
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

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. gmail.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {result?.dnsRecord && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DNS Record (_mta-sts)</span>
              <CopyButton value={result.dnsRecord.raw} />
            </div>
            <code className="text-sm font-mono break-all">{result.dnsRecord.raw}</code>
            <p className="text-xs text-muted-foreground mt-1">ID: {result.dnsRecord.id} · TTL: {result.dnsRecord.ttl}s</p>
          </div>
          {result.policy && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Policy File</p>
              {Object.entries(result.policy).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <code className="text-sm font-mono text-blue-500">{k}</code>
                  <code className="text-sm font-mono">{v}</code>
                </div>
              ))}
            </div>
          )}
          {result.policyError && <p className="text-sm text-yellow-600">⚠ {result.policyError}</p>}
        </div>
      )}
    </div>
  );
}
