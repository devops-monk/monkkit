"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type SpfRecord } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const qualifierLabel: Record<string, string> = {
  "+": "PASS", "-": "FAIL", "~": "SOFTFAIL", "?": "NEUTRAL",
};
const qualifierColor: Record<string, string> = {
  "+": "text-green-600 bg-green-500/10",
  "-": "text-red-600 bg-red-500/10",
  "~": "text-yellow-600 bg-yellow-500/10",
  "?": "text-gray-600 bg-gray-500/10",
};

export default function SpfLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [record, setRecord] = useState<SpfRecord | null>(null);
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
          placeholder="Enter domain (e.g. gmail.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {record && (
        <div className="flex flex-col gap-4">
          {record.warnings.length > 0 && (
            <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
              {record.warnings.map((w, i) => <p key={i} className="text-sm text-yellow-700 dark:text-yellow-400">⚠ {w}</p>)}
            </div>
          )}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw Record</span>
              <CopyButton value={record.raw} />
            </div>
            <code className="text-sm font-mono break-all">{record.raw}</code>
            <p className="text-xs text-muted-foreground mt-1">TTL: {record.ttl}s</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mechanisms</p>
            <div className="flex flex-col gap-2">
              {record.mechanisms.map((m, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/40">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${qualifierColor[m.qualifier]}`}>
                    {qualifierLabel[m.qualifier]}
                  </span>
                  <code className="text-sm font-mono">{m.type}{m.value ? `:${m.value}` : ""}</code>
                  <span className="text-xs text-muted-foreground ml-auto">{m.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
