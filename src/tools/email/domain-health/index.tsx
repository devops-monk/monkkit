"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type DomainHealthCheck } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const statusColor: Record<string, string> = {
  pass: "text-green-600 bg-green-500/10 border-green-500/30",
  warn: "text-yellow-600 bg-yellow-500/10 border-yellow-500/30",
  fail: "text-red-600 bg-red-500/10 border-red-500/30",
};
const statusIcon: Record<string, string> = { pass: "✓", warn: "⚠", fail: "✗" };

export default function DomainHealthTool({ toolMeta: _ }: ToolComponentProps) {
  const [domain, setDomain] = useState("");
  const [checks, setChecks] = useState<DomainHealthCheck[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setChecks([]);
    const r = await process({ domain });
    if (r.success) { setChecks(r.checks!); setScore(r.score!); setError(""); }
    else setError(r.error!);
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setChecks([]); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. google.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Checking…" : "Check Health"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {score !== null && (
        <div className={`rounded-lg border p-4 ${score >= 80 ? "border-green-500/30 bg-green-500/5" : score >= 50 ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold font-mono ${score >= 80 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>{score}%</span>
            <div>
              <p className="text-sm font-medium">Domain Health Score for {domain}</p>
              <p className="text-xs text-muted-foreground">{checks.filter(c => c.status === "pass").length} of {checks.length} checks passed</p>
            </div>
          </div>
        </div>
      )}
      {checks.length > 0 && (
        <div className="flex flex-col gap-2">
          {checks.map((check) => (
            <div key={check.name} className={`rounded-lg border p-4 ${statusColor[check.status]}`}>
              <div className="flex items-start gap-3">
                <span className="text-sm font-bold">{statusIcon[check.status]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-xs opacity-80 mt-0.5">{check.message}</p>
                  {check.value && (
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs font-mono opacity-70 truncate flex-1">{check.value}</code>
                      <CopyButton value={check.value} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
