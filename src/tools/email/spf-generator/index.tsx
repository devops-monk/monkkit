"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function SpfGeneratorTool({ toolMeta: _ }: ToolComponentProps) {
  const [policy, setPolicy] = useState<"~all" | "-all" | "?all" | "+all">("~all");
  const [includeDomains, setIncludeDomains] = useState("_spf.google.com");
  const [allowedIps4, setAllowedIps4] = useState("");
  const [allowedIps6, setAllowedIps6] = useState("");
  const [includeA, setIncludeA] = useState(false);
  const [includeMx, setIncludeMx] = useState(true);
  const [record, setRecord] = useState("");

  const generate = () => {
    const r = process({ policy, includeDomains, allowedIps4, allowedIps6, includeA, includeMx });
    if (r.success) setRecord(r.record!);
  };

  const policyLabels: Record<string, string> = {
    "~all": "~all — SoftFail (recommended for testing)",
    "-all": "-all — Hard Fail (recommended for production)",
    "?all": "?all — Neutral (no recommendation)",
    "+all": "+all — Pass all (NOT recommended)",
  };

  return (
    <div className="flex flex-col gap-5 p-4 max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Policy (all mechanism)</Label>
        <Select value={policy} onValueChange={(v) => setPolicy(v as typeof policy)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(policyLabels).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Switch id="mx" checked={includeMx} onCheckedChange={setIncludeMx} />
          <Label htmlFor="mx" className="text-sm cursor-pointer">Include MX records</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="a" checked={includeA} onCheckedChange={setIncludeA} />
          <Label htmlFor="a" className="text-sm cursor-pointer">Include A records</Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Include Domains <span className="text-muted-foreground font-normal">(one per line or comma-separated)</span></Label>
        <textarea value={includeDomains} onChange={(e) => setIncludeDomains(e.target.value)}
          placeholder="_spf.google.com&#10;servers.mcsv.net"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Allowed IPv4 Ranges <span className="text-muted-foreground font-normal">(one per line)</span></Label>
        <Input value={allowedIps4} onChange={(e) => setAllowedIps4(e.target.value)} placeholder="e.g. 192.168.1.0/24" className="font-mono" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Allowed IPv6 Ranges <span className="text-muted-foreground font-normal">(one per line)</span></Label>
        <Input value={allowedIps6} onChange={(e) => setAllowedIps6(e.target.value)} placeholder="e.g. 2001:db8::/32" className="font-mono" />
      </div>

      <Button onClick={generate}>Generate SPF Record</Button>

      {record && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated SPF Record</p>
            <CopyButton value={record} />
          </div>
          <code className="text-sm font-mono break-all">{record}</code>
          <p className="text-xs text-muted-foreground mt-2">Publish as a TXT record at the root of your domain.</p>
        </div>
      )}
    </div>
  );
}
