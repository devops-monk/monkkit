"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type TlsrptRecord } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function TlsrptTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [record, setRecord] = useState<TlsrptRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain });
    if (r.success) { setRecord(r.record!); setError(""); }
    else { setRecord(null); setError(r.error!); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setRecord(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. google.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {record && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TLSRPT Record</span>
              <CopyButton value={record.raw} />
            </div>
            <code className="text-sm font-mono break-all">{record.raw}</code>
            <p className="text-xs text-muted-foreground mt-1">Version: {record.version} · TTL: {record.ttl}s</p>
          </div>
          {record.rua.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Report URIs (rua)</p>
              {record.rua.map((u) => <code key={u} className="text-sm font-mono block text-blue-500">{u}</code>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
