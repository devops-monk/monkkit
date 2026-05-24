"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function DomainDossierTool({ toolMeta: _ }: ToolComponentProps) {
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

  const SAMPLES = ["google.com", "github.com", "cloudflare.com"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. example.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Investigating…" : "Investigate"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setDomain(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="flex flex-col gap-4">
          {result.whois && Object.keys(result.whois).length > 0 && (
            <Section title={`WHOIS — ${result.domain}`}>
              {Object.entries(result.whois).map(([k, v]) => <Row key={k} label={k} value={v} />)}
            </Section>
          )}
          {result.geoip && Object.keys(result.geoip).length > 0 && (
            <Section title="IP Geolocation">
              {Object.entries(result.geoip).filter(([, v]) => v).map(([k, v]) => <Row key={k} label={k} value={v} />)}
            </Section>
          )}
          {result.dns && (
            <Section title="DNS Records">
              {Object.entries(result.dns).filter(([, v]) => v.length > 0).map(([type, records]) => (
                <div key={type} className="py-2 border-b border-border last:border-0">
                  <span className="text-xs font-bold text-blue-500 font-mono mr-3">{type}</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {records.map((r, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <code className="text-sm font-mono break-all flex-1">{r}</code>
                        <CopyButton value={r} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[150px]">{label}</span>
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <code className="text-sm font-mono break-all flex-1">{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}
