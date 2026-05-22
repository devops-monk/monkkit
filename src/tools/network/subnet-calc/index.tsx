"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type SubnetInfo } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

function Row({ label, value }: { label: string; value: string | number }) {
  const v = String(value);
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[160px]">{label}</span>
      <div className="flex items-center gap-2 flex-1">
        <code className="text-sm font-mono break-all flex-1">{v}</code>
        <CopyButton value={v} />
      </div>
    </div>
  );
}

export default function SubnetCalcTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [info, setInfo] = useState<SubnetInfo | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input });
    if (r.success) { setInfo(r.info!); setError(""); }
    else { setInfo(null); setError(r.error!); }
  };

  const SAMPLES = ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.1 255.255.255.0"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => { setInput(e.target.value); setInfo(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="CIDR (192.168.1.0/24) or IP + mask (192.168.1.0 255.255.255.0)"
          className="font-mono" />
        <Button onClick={run} disabled={!input.trim()}>Calculate</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setInput(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {info && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Hosts", value: info.totalHosts.toLocaleString() },
              { label: "Usable Hosts", value: info.usableHosts.toLocaleString() },
              { label: "CIDR", value: `/${info.cidr}` },
              { label: "IP Class", value: info.ipClass },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-3">
                <span className="text-xs text-muted-foreground block">{label}</span>
                <span className="text-xl font-bold font-mono">{value}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <Row label="Network Address" value={info.networkAddress} />
            <Row label="Broadcast Address" value={info.broadcastAddress} />
            <Row label="First Host" value={info.firstHost} />
            <Row label="Last Host" value={info.lastHost} />
            <Row label="Subnet Mask" value={info.subnetMask} />
            <Row label="Wildcard Mask" value={info.wildcardMask} />
            <Row label="Binary Mask" value={info.binaryMask} />
            <Row label="Binary Network" value={info.binaryNetwork} />
          </div>
        </div>
      )}
    </div>
  );
}
