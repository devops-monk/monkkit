"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type MxRecord } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function MxLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [records, setRecords] = useState<MxRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain });
    if (r.success) { setRecords(r.records!); setError(""); }
    else { setRecords([]); setError(r.error!); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setRecords([]); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain or email (e.g. gmail.com or user@gmail.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["gmail.com", "outlook.com", "yahoo.com"].map((s) => (
          <button key={s} onClick={() => setDomain(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {records.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">MX Records — {domain.split("@").pop()}</p>
          <div className="flex flex-col gap-2">
            {records.map((r) => (
              <div key={r.exchange} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/40">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-muted-foreground w-8 text-right">{r.priority}</span>
                  <code className="text-sm font-mono">{r.exchange}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">TTL: {r.ttl}s</span>
                  <CopyButton value={r.exchange} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
