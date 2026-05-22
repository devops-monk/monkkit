"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type PropagationResult } from "./logic";
import type { ToolComponentProps } from "@/types/registry";
import type { DnsRecordType } from "@/lib/dns";

const RECORD_TYPES: DnsRecordType[] = ["A", "AAAA", "MX", "CNAME", "TXT", "NS"];

export default function DnsPropagationTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [type, setType] = useState<DnsRecordType>("A");
  const [results, setResults] = useState<PropagationResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain, type });
    if (r.success) { setResults(r.results ?? []); setError(""); }
    else setError(r.error!);
    setLoading(false);
  };

  const statusColor = { ok: "text-green-600", nxdomain: "text-red-600", error: "text-yellow-600" };
  const statusBg = { ok: "bg-green-500/10", nxdomain: "bg-red-500/10", error: "bg-yellow-500/10" };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setResults([]); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. example.com)" className="font-mono" />
        <Select value={type} onValueChange={(v) => setType(v as DnsRecordType)}>
          <SelectTrigger className="h-9 w-24 font-mono text-sm"><SelectValue /></SelectTrigger>
          <SelectContent className="font-mono">
            {RECORD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Checking…" : "Check"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {results.length > 0 && (
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {results.map((r) => (
            <div key={r.provider} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusBg[r.status]} ${statusColor[r.status]}`}>
                  {r.status === "ok" ? "✓" : r.status === "nxdomain" ? "NXDOMAIN" : "ERR"}
                </span>
                <span className="text-sm font-medium">{r.provider}</span>
                {r.ttl && <span className="text-xs text-muted-foreground ml-auto">TTL: {r.ttl}s</span>}
              </div>
              {r.records.length > 0 ? (
                <div className="flex flex-col gap-1 ml-8">
                  {r.records.map((rec, i) => (
                    <code key={i} className="text-xs font-mono text-muted-foreground">{rec}</code>
                  ))}
                </div>
              ) : r.error ? (
                <p className="text-xs text-yellow-600 ml-8">{r.error}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
