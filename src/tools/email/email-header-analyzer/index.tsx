"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const AUTH_COLOR = { pass: "text-green-600", fail: "text-red-600", "": "text-muted-foreground" };

export default function EmailHeaderAnalyzerTool({ toolMeta: _ }: ToolComponentProps) {
  const [headers, setHeaders] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ headers });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
  };

  const resetInput = (val: string) => { setHeaders(val); setResult(null); setError(""); };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Paste Email Headers</Label>
        <textarea value={headers} onChange={(e) => resetInput(e.target.value)}
          placeholder="Paste raw email headers here (From:, To:, Received:, DKIM-Signature:, etc.)..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={run} disabled={!headers.trim()}>Analyze</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
      </div>
      {error && <ErrorDisplay message={error} />}
      {result?.summary && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Summary</p>
            {Object.entries(result.summary).filter(([, v]) => v).map(([key, value]) => (
              <div key={key} className="flex items-start gap-4 py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground capitalize min-w-[120px]">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <span className={`text-sm font-mono break-all flex-1 ${["spfResult","dkimResult","dmarcResult"].includes(key) ? (value === "pass" ? AUTH_COLOR.pass : AUTH_COLOR.fail) : ""}`}>{value as string}</span>
              </div>
            ))}
          </div>

          {result.hops && result.hops.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Delivery Hops {result.totalDelay ? `— Total: ${result.totalDelay}s` : ""}
              </p>
              {result.hops.map((hop, i) => (
                <div key={i} className="mb-3 pb-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-xs font-mono">{hop.by ?? hop.from ?? "Unknown"}</span>
                    {hop.delay !== undefined && <span className="ml-auto text-xs text-muted-foreground">+{hop.delay}s</span>}
                  </div>
                  {hop.timestamp && <p className="text-xs text-muted-foreground ml-6">{hop.timestamp}</p>}
                  {hop.with && <p className="text-xs text-muted-foreground ml-6">via {hop.with}</p>}
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Headers ({result.headers?.length})</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {result.headers?.map((h, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-border last:border-0">
                  <code className="text-xs font-mono text-blue-500 min-w-[160px] shrink-0">{h.name}:</code>
                  <code className="text-xs font-mono text-muted-foreground break-all flex-1">{h.value}</code>
                  <CopyButton value={h.value} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
