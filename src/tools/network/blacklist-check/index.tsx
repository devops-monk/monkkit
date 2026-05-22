"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type BlacklistResult } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function BlacklistCheckTool({ toolMeta: _ }: ToolComponentProps) {
  const [ip, setIp] = useState("");
  const [results, setResults] = useState<BlacklistResult[]>([]);
  const [listedCount, setListedCount] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setResults([]);
    const r = await process({ input: ip });
    if (r.success) {
      setResults(r.results ?? []);
      setListedCount(r.listedCount ?? 0);
      setTotal(r.totalChecked ?? 0);
      setError("");
    } else {
      setError(r.error!);
    }
    setLoading(false);
  };

  const listed = results.filter((r) => r.listed);
  const clean = results.filter((r) => !r.listed);

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={ip} onChange={(e) => { setIp(e.target.value); setResults([]); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter IPv4 address (e.g. 8.8.8.8)" className="font-mono" />
        <Button onClick={run} disabled={!ip.trim() || loading}>{loading ? "Checking…" : "Check"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {listedCount !== null && (
        <div className={`rounded-lg border p-4 ${listedCount === 0 ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <p className={`text-sm font-semibold ${listedCount === 0 ? "text-green-600" : "text-red-600"}`}>
            {listedCount === 0 ? `✓ Not listed on any of ${total} checked blacklists` : `✗ Listed on ${listedCount} of ${total} blacklists`}
          </p>
        </div>
      )}
      {listed.length > 0 && (
        <div className="rounded-lg border border-red-500/30 bg-card p-4">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Listed</p>
          {listed.map((r) => (
            <div key={r.rbl} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <code className="text-sm font-mono text-red-500">{r.rbl}</code>
              <code className="text-xs text-muted-foreground">{r.response}</code>
            </div>
          ))}
        </div>
      )}
      {clean.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Clean ({clean.length})</p>
          <div className="flex flex-wrap gap-2">
            {clean.map((r) => (
              <span key={r.rbl} className="text-xs font-mono px-2 py-1 rounded bg-green-500/10 text-green-700 dark:text-green-400">{r.rbl}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
