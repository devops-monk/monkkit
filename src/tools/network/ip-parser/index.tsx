"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type IpInfo } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[140px]">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="text-sm font-mono break-all text-foreground">{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export default function IpParserTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [info, setInfo] = useState<IpInfo | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input });
    if (r.success) { setInfo(r.info!); setError(""); }
    else { setInfo(null); setError(r.error!); }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => { setInput(e.target.value); setInfo(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter IP address (e.g. 192.168.1.1 or ::1)"
          className="font-mono"
        />
        <Button onClick={run} disabled={!input.trim()}>Parse</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {["192.168.1.1", "8.8.8.8", "127.0.0.1", "::1", "2001:db8::1"].map((ip) => (
          <button key={ip} onClick={() => setInput(ip)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{ip}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {info && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">IPv{info.version} Address</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              info.isLoopback ? "bg-yellow-500/10 text-yellow-600" :
              info.isPrivate ? "bg-blue-500/10 text-blue-600" :
              info.isMulticast ? "bg-purple-500/10 text-purple-600" :
              "bg-green-500/10 text-green-600"
            }`}>{info.type}</span>
          </div>
          <InfoRow label="Address" value={info.address} />
          {info.octets && <InfoRow label="Octets" value={info.octets.join(" . ")} />}
          {info.decimal !== undefined && <InfoRow label="Decimal" value={String(info.decimal)} />}
          {info.hex && <InfoRow label="Hex" value={info.hex} />}
          {info.binary && <InfoRow label="Binary" value={info.binary} />}
        </div>
      )}
    </div>
  );
}
