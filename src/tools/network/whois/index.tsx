"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function WhoisTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [formatted, setFormatted] = useState<Record<string, string> | null>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain });
    if (r.success) { setFormatted(r.formatted!); setSource(r.source ?? ""); setError(""); }
    else { setFormatted(null); setError(r.error!); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setFormatted(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain or IP (e.g. example.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["google.com", "github.com", "cloudflare.com"].map((s) => (
          <button key={s} onClick={() => setDomain(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {formatted && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WHOIS — {domain}</span>
            {source && <span className="text-xs text-muted-foreground">via {source.toUpperCase()}</span>}
          </div>
          {Object.entries(formatted).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[160px]">{key}</span>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <code className="text-sm font-mono break-all flex-1">{value}</code>
                <CopyButton value={value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
