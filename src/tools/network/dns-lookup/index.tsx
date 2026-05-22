"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";
import type { DnsRecordType } from "@/lib/dns";

const RECORD_TYPES: DnsRecordType[] = ["A", "AAAA", "MX", "CNAME", "TXT", "NS", "SOA", "SRV", "PTR", "CAA", "DNSKEY", "DS", "RRSIG", "NSEC", "NAPTR"];

export default function DnsLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [type, setType] = useState<DnsRecordType>("A");
  const [records, setRecords] = useState<string[]>([]);
  const [ttl, setTtl] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain, type });
    if (r.success) {
      setRecords(r.records ?? []);
      setTtl(r.answer?.Answer?.[0]?.TTL ?? null);
      setError("");
    } else {
      setRecords([]);
      setError(r.error!);
    }
    setLoading(false);
  };

  const SAMPLES = ["google.com", "github.com", "cloudflare.com"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={domain}
          onChange={(e) => { setDomain(e.target.value); setRecords([]); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. google.com)"
          className="font-mono"
        />
        <Select value={type} onValueChange={(v) => setType(v as DnsRecordType)}>
          <SelectTrigger className="h-9 w-28 text-sm font-mono"><SelectValue /></SelectTrigger>
          <SelectContent className="font-mono">
            {RECORD_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setDomain(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {records.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{type} Records — {domain}</span>
              {ttl !== null && <span className="text-xs text-muted-foreground">TTL: {ttl}s</span>}
            </div>
            <CopyButton value={records.join("\n")} />
          </div>
          <div className="flex flex-col gap-2">
            {records.map((r, i) => (
              <div key={i} className="flex items-start justify-between gap-2 p-2 rounded bg-muted/40">
                <code className="text-sm font-mono break-all flex-1">{r}</code>
                <CopyButton value={r} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
