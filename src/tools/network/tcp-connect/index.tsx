"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, WELL_KNOWN_PORTS } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const PRESETS = [
  { label: "MySQL", host: "", port: "3306" },
  { label: "PostgreSQL", host: "", port: "5432" },
  { label: "SSH", host: "", port: "22" },
  { label: "SMTP", host: "", port: "25" },
  { label: "HTTP", host: "", port: "80" },
  { label: "HTTPS", host: "", port: "443" },
  { label: "Redis", host: "", port: "6379" },
];

export default function TcpConnectTool({ toolMeta: _ }: ToolComponentProps) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("3306");
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

  const portNum = parseInt(port, 10);
  const serviceName = WELL_KNOWN_PORTS[portNum];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground font-mono">telnet &lt;host&gt; &lt;port&gt;</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={host}
          onChange={(e) => { setHost(e.target.value); setResult(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Host or IP (e.g. db.example.com)"
          className="font-mono flex-1"
        />
        <div className="relative">
          <Input
            value={port}
            onChange={(e) => { setPort(e.target.value); setResult(null); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="Port"
            className="font-mono w-28 pr-1"
          />
          {serviceName && (
            <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-muted-foreground/70">{serviceName}</span>
          )}
        </div>
        <Button onClick={run} disabled={!host.trim() || !port.trim() || loading} className="shrink-0">
          {loading ? "Connecting…" : "Connect"}
        </Button>
      </div>

      <div className="flex gap-1.5 flex-wrap mt-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => setPort(p.port)}
            className={`text-xs px-2 py-1 rounded font-mono ${port === p.port ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
          >
            {p.label} <span className="opacity-60">:{p.port}</span>
          </button>
        ))}
      </div>

      {error && <ErrorDisplay message={error} />}

      {result && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          {/* Terminal header */}
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <span className="w-3 h-3 rounded-full bg-green-400/70" />
            </div>
            <span className="text-xs font-mono text-muted-foreground ml-2">
              telnet {result.host} {result.port}
            </span>
          </div>

          {/* Terminal body */}
          <div className="bg-neutral-950 text-green-400 p-4 font-mono text-sm min-h-[120px]">
            <p className="text-muted-foreground/60 text-xs mb-2">
              Trying {result.host}:{result.port}...
            </p>

            {result.open ? (
              <>
                <p className="text-green-400">
                  Connected to {result.host}.
                </p>
                <p className="text-muted-foreground/60 text-xs mb-3">
                  Escape character is &apos;^]&apos;. — {result.ms}ms
                </p>
                {result.banner ? (
                  <div className="mt-2">
                    <div className="flex items-start justify-between gap-2">
                      <pre className="text-green-300 text-xs whitespace-pre-wrap break-all flex-1">{result.banner}</pre>
                      <CopyButton value={result.banner} />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground/60 text-xs italic">
                    (connection open — no banner received)
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-400">
                telnet: Unable to connect to remote host: Connection refused
              </p>
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${result.open ? "bg-green-500" : "bg-red-500"}`} />
              {result.open ? "Port open" : "Port closed / unreachable"}
              {serviceName && <span className="text-muted-foreground/60">({serviceName})</span>}
            </span>
            {result.ms != null && <span>{result.ms}ms</span>}
          </div>
        </div>
      )}
    </div>
  );
}
