"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type DkimRecord } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const COMMON_SELECTORS = ["google", "selector1", "selector2", "mail", "default", "k1", "smtp", "dkim", "sig1"];

export default function DkimLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("google");
  const [record, setRecord] = useState<DkimRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ domain, selector });
    if (r.success) { setRecord(r.record!); setError(""); }
    else { setRecord(null); setError(r.error!); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={selector} onChange={(e) => { setSelector(e.target.value); setRecord(null); setError(""); }}
          placeholder="Selector (e.g. google)" className="font-mono w-36 shrink-0" />
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setRecord(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Domain (e.g. gmail.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || !selector.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Common selectors:</span>
        {COMMON_SELECTORS.map((s) => (
          <button key={s} onClick={() => setSelector(s)} className={`text-xs px-2 py-0.5 rounded font-mono border ${selector === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {record && (
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DKIM Key — {selector}._domainkey.{domain}</span>
            </div>
            {[
              ["Version", record.version], ["Key Type", record.keyType],
              ["Hash Algorithms", record.hashAlgos], ["Service Type", record.serviceType],
              ["Flags", record.flags], ["TTL", `${record.ttl}s`],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{k}</span>
                <code className="text-sm font-mono">{v}</code>
              </div>
            ))}
          </div>
          {record.publicKey && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Public Key</span>
                <CopyButton value={record.publicKey} />
              </div>
              <code className="text-xs font-mono break-all text-muted-foreground">{record.publicKey}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
