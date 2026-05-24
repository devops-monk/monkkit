"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function BrowserMirrorTool({ toolMeta: _ }: ToolComponentProps) {
  const [data, setData] = useState<Record<string, string | number | boolean | null> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({});
    if (r.success && r.data) { setData(r.data); setError(""); }
    else { setData(null); setError(r.error ?? "Failed to gather browser info"); }
    setLoading(false);
  };

  const formatValue = (v: string | number | boolean | null): string => {
    if (v === null) return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    return String(v);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <p className="text-sm text-muted-foreground">See what information your browser exposes to websites you visit.</p>
      <div>
        <Button onClick={run} disabled={loading}>{loading ? "Gathering…" : "Reveal My Browser"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {data && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Browser Profile</p>
            <CopyButton value={Object.entries(data).map(([k, v]) => `${k}: ${formatValue(v)}`).join("\n")} />
          </div>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[160px]">{key}</span>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <code className={`text-sm font-mono break-all flex-1 ${value === null ? "text-muted-foreground/50" : ""}`}>
                  {formatValue(value)}
                </code>
                {value !== null && <CopyButton value={formatValue(value)} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
