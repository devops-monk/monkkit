"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, COMMON_PORTS } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function PortCheckTool({ toolMeta: _ }: ToolComponentProps) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("80");
  const [result, setResult] = useState<Awaited<ReturnType<typeof process>> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ host, port });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
    setLoading(false);
  };

  const COMMON_PORT_LIST = [21, 22, 25, 53, 80, 110, 143, 443, 587, 3306, 3389, 5432, 6379, 8080];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={host} onChange={(e) => { setHost(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Host or IP (e.g. example.com)" className="font-mono flex-1" />
        <Input value={port} onChange={(e) => { setPort(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Port" className="font-mono w-24" />
        <Button onClick={run} disabled={!host.trim() || !port.trim() || loading}>{loading ? "Checking…" : "Check"}</Button>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Common ports:</p>
        <div className="flex gap-1.5 flex-wrap">
          {COMMON_PORT_LIST.map((p) => (
            <button key={p} onClick={() => setPort(String(p))}
              className={`text-xs px-2 py-1 rounded font-mono ${String(p) === port ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}>
              {p} <span className="text-muted-foreground/60">{COMMON_PORTS[p]}</span>
            </button>
          ))}
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-4">
            <span className={`text-4xl font-bold ${result.open ? "text-green-600" : "text-red-500"}`}>
              {result.open ? "Open" : "Closed"}
            </span>
            <div>
              <p className="font-mono text-sm">{result.host}:{result.port}</p>
              {COMMON_PORTS[result.port!] && (
                <p className="text-xs text-muted-foreground">{COMMON_PORTS[result.port!]}</p>
              )}
              {result.ms != null && (
                <p className="text-xs text-muted-foreground mt-0.5">{result.ms}ms response time</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
