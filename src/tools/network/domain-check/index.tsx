"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function DomainCheckTool({ toolMeta: _ }: ToolComponentProps) {
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

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={domain} onChange={(e) => { setDomain(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter domain (e.g. mynewdomain.com)" className="font-mono" />
        <Button onClick={run} disabled={!domain.trim() || loading}>{loading ? "Checking…" : "Check"}</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-2xl font-bold font-mono ${result.available ? "text-green-600" : "text-red-500"}`}>
              {result.domain}
            </span>
            <span className={`text-sm font-semibold px-2 py-0.5 rounded ${result.available ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"}`}>
              {result.available ? "Available" : "Registered"}
            </span>
          </div>
          {!result.available && (
            <div className="flex flex-col gap-0">
              {result.registrar && <Row label="Registrar" value={result.registrar} />}
              {result.created && <Row label="Created" value={result.created} />}
              {result.expires && <Row label="Expires" value={result.expires} />}
              {result.status?.length! > 0 && <Row label="Status" value={result.status!.join(", ")} />}
              {result.nameservers?.length! > 0 && (
                <div className="py-2 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground">Nameservers</span>
                  <div className="flex flex-col gap-1 mt-1">
                    {result.nameservers!.map((ns, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <code className="text-sm font-mono flex-1">{ns}</code>
                        <CopyButton value={ns} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground min-w-[120px]">{label}</span>
      <div className="flex items-center gap-2 flex-1 justify-end">
        <code className="text-sm font-mono text-right">{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}
