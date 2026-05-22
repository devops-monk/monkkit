"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type BimiRecord } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function BimiLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [record, setRecord] = useState<BimiRecord | null>(null);
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
          placeholder="Enter domain (e.g. fastmail.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {record && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">BIMI Record</span>
              <CopyButton value={record.raw} />
            </div>
            <code className="text-sm font-mono break-all">{record.raw}</code>
            <p className="text-xs text-muted-foreground mt-1">TTL: {record.ttl}s</p>
          </div>
          {record.logoUrl && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Logo URL (l=)</p>
              <code className="text-sm font-mono break-all text-blue-500">{record.logoUrl}</code>
            </div>
          )}
          {record.vmcUrl && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verified Mark Certificate (a=)</p>
              <code className="text-sm font-mono break-all text-blue-500">{record.vmcUrl}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
