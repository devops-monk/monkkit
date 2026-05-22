"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function AsnLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [data, setData] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ input });
    if (r.success && r.data) { setData(r.data as Record<string, string>); setError(""); }
    else setError(r.error ?? "Lookup failed");
    setLoading(false);
  };

  const SAMPLES = ["8.8.8.8", "1.1.1.1", "208.67.222.222"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => { setInput(e.target.value); setData(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter IP address (e.g. 8.8.8.8)" className="font-mono" />
        <Button onClick={run} disabled={!input.trim() || loading}>{loading ? "Looking up…" : "Lookup"}</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => <button key={s} onClick={() => setInput(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>)}
      </div>
      {error && <ErrorDisplay message={error} />}
      {data && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">ASN / IP Info — {data.ip}</p>
          {Object.entries(data).filter(([, v]) => v).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground capitalize">{key}</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono">{String(value)}</code>
                <CopyButton value={String(value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
