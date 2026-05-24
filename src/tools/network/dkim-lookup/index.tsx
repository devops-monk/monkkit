"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const COMMON_SELECTORS = ["google", "selector1", "selector2", "default", "mail", "dkim", "k1"];

export default function DkimLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("google");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain, selector });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={selector} onChange={(e) => { setSelector(e.target.value); setResult(null); setError(""); }}
          placeholder="Selector" className="font-mono w-32 shrink-0" />
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Domain (e.g. gmail.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || !selector.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Common selectors:</p>
        <div className="flex gap-2 flex-wrap">
          {COMMON_SELECTORS.map((s) => (
            <button key={s} onClick={() => setSelector(s)} className={`text-xs px-2 py-1 rounded font-mono ${selector === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>{s}</button>
          ))}
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              DKIM — {result.selector}._domainkey.{result.domain}
            </p>
            <CopyButton value={result.record!} />
          </div>
          {result.fields && Object.entries(result.fields).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[130px]">{key}</span>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <code className="text-xs font-mono break-all flex-1">{value}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
