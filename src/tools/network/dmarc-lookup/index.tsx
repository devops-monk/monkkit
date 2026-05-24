"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const POLICY_COLOR: Record<string, string> = {
  "None": "bg-yellow-500/10 text-yellow-600",
  "Quarantine": "bg-orange-500/10 text-orange-600",
  "Reject": "bg-green-500/10 text-green-600",
};

export default function DmarcLookupTool({ toolMeta: _ }: ToolComponentProps) {
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
  const policyKey = result?.policy?.split(" ")[0] ?? "";

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
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">_dmarc.{result.domain}</p>
              {result.policy && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${POLICY_COLOR[policyKey] ?? "bg-muted"}`}>
                  {policyKey}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0">
              {result.policy && <Row label="Policy" value={result.policy} />}
              {result.subdomainPolicy && <Row label="Subdomain Policy" value={result.subdomainPolicy} />}
              <Row label="Enforcement %" value={`${result.percentage}%`} />
              <Row label="DKIM Alignment" value={result.alignment?.dkim ?? "—"} />
              <Row label="SPF Alignment" value={result.alignment?.spf ?? "—"} />
              {result.reportingUris && result.reportingUris.length > 0 && (
                <Row label="Report URIs" value={result.reportingUris.join(", ")} />
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Raw Record</p>
              <CopyButton value={result.record!} />
            </div>
            <code className="text-xs font-mono break-all text-muted-foreground">{result.record}</code>
          </div>
        </div>
      )}
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
