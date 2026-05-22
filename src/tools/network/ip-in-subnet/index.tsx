"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";
import { CheckCircle2, XCircle } from "lucide-react";

const EXAMPLES = [
  { ip: "192.168.1.50",   subnet: "192.168.1.0/24",  label: "Private /24" },
  { ip: "10.0.0.1",       subnet: "10.0.0.0/8",      label: "Private /8" },
  { ip: "172.31.255.255", subnet: "172.16.0.0/12",   label: "Private /12" },
  { ip: "8.8.8.8",        subnet: "192.168.1.0/24",  label: "Outside" },
];

export default function IpInSubnetTool({ toolMeta: _ }: ToolComponentProps) {
  const [ip, setIp] = useState("192.168.1.50");
  const [subnet, setSubnet] = useState("192.168.1.0/24");
  const [result, setResult] = useState<ReturnType<typeof process> | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ ip, subnet });
    if (r.success) { setResult(r); setError(""); }
    else { setResult(null); setError(r.error!); }
  };

  const loadExample = (e: typeof EXAMPLES[0]) => {
    setIp(e.ip);
    setSubnet(e.subnet);
    setResult(null);
    setError("");
  };

  return (
    <div className="flex flex-col gap-5 p-4 max-w-2xl mx-auto">

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">IP Address</Label>
          <Input
            value={ip}
            onChange={(e) => { setIp(e.target.value); setResult(null); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="e.g. 192.168.1.50"
            className="font-mono"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Subnet (CIDR)</Label>
          <Input
            value={subnet}
            onChange={(e) => { setSubnet(e.target.value); setResult(null); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="e.g. 192.168.1.0/24"
            className="font-mono"
          />
        </div>
      </div>

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => loadExample(ex)}
            className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <Button onClick={run} disabled={!ip.trim() || !subnet.trim()}>
        Check IP
      </Button>

      {error && <ErrorDisplay message={error} />}

      {result?.result && (
        <div className="flex flex-col gap-4">
          {/* Verdict */}
          <div className={`rounded-2xl border-2 p-6 flex items-center gap-5 ${
            result.result.inSubnet
              ? "border-green-500/40 bg-green-500/8"
              : "border-red-500/40 bg-red-500/8"
          }`}>
            {result.result.inSubnet
              ? <CheckCircle2 className="h-12 w-12 text-green-500 shrink-0" />
              : <XCircle className="h-12 w-12 text-red-500 shrink-0" />
            }
            <div>
              <p className={`text-2xl font-extrabold ${result.result.inSubnet ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {result.result.inSubnet ? "Inside the subnet" : "Outside the subnet"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                <span className="font-semibold text-foreground">{result.result.ip}</span>
                {" "}is{result.result.inSubnet ? "" : " not"} within{" "}
                <span className="font-semibold text-foreground">{result.result.subnet}</span>
              </p>
            </div>
          </div>

          {/* Subnet details */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Subnet Details
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {[
                ["Network address",   result.result.networkAddress],
                ["Broadcast address", result.result.broadcastAddress],
                ["First usable host", result.result.firstHost],
                ["Last usable host",  result.result.lastHost],
                ["Subnet mask",       result.result.subnetMask],
                ["CIDR prefix",       `/${result.result.cidr}`],
                ["Total addresses",   result.result.totalHosts.toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground shrink-0">{label}</span>
                  <code className="text-sm font-mono font-semibold">{value}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Binary comparison */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Binary Comparison
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "IP address", value: result.result.ipBinary, highlight: result.result.inSubnet },
                { label: "Network",    value: result.result.networkBinary, highlight: false },
                { label: "Broadcast",  value: result.result.broadcastBinary, highlight: false },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <code className="text-xs font-mono bg-muted rounded-md px-2 py-1.5 flex-1 overflow-x-auto whitespace-nowrap">
                    {value.split(".").map((octet, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-muted-foreground">.</span>}
                        <span className={i < Math.floor(result.result!.cidr / 8) ? "text-primary" : ""}>{octet}</span>
                      </span>
                    ))}
                  </code>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-medium">Indigo</span> octets = network portion (/{result.result.cidr})
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
