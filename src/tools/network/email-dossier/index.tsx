"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function EmailDossierTool({ toolMeta: _ }: ToolComponentProps) {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ email });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
    setLoading(false);
  };

  const badge = (ok: boolean | undefined, yes: string, no: string) => (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${ok ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
      {ok ? yes : no}
    </span>
  );

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={email} onChange={(e) => { setEmail(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter email address (e.g. user@example.com)" className="font-mono" />
        <Button onClick={run} disabled={!email.trim() || loading}>{loading ? "Checking…" : "Check"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Email Analysis — {result.email}</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Syntax</span>
                {badge(result.syntaxValid, "Valid", "Invalid")}
              </div>
              {result.syntaxValid && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">MX Records</span>
                    {badge(result.hasMx, "Found", "None")}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">SPF</span>
                    {badge(!!result.spfRecord, "Configured", "Missing")}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">DMARC</span>
                    {badge(!!result.dmarcRecord, "Configured", "Missing")}
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Provider</span>
                    <span className="text-sm font-mono">{result.providerHint ? `Free (${result.providerHint})` : result.domain}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground">Disposable</span>
                    {badge(!result.disposable, "Not detected", "Likely disposable")}
                  </div>
                </>
              )}
            </div>
          </div>

          {result.mxRecords && result.mxRecords.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">MX Records</p>
              {result.mxRecords.map((mx, i) => (
                <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-border last:border-0">
                  <code className="text-sm font-mono flex-1">{mx}</code>
                  <CopyButton value={mx} />
                </div>
              ))}
            </div>
          )}

          {result.spfRecord && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">SPF Record</p>
              <div className="flex items-start gap-2">
                <code className="text-sm font-mono break-all flex-1 text-muted-foreground">{result.spfRecord}</code>
                <CopyButton value={result.spfRecord} />
              </div>
            </div>
          )}

          {result.dmarcRecord && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">DMARC Record</p>
              <div className="flex items-start gap-2">
                <code className="text-sm font-mono break-all flex-1 text-muted-foreground">{result.dmarcRecord}</code>
                <CopyButton value={result.dmarcRecord} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
