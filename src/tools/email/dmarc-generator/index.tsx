"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function DmarcGeneratorTool({ toolMeta: _ }: ToolComponentProps) {
  const [policy, setPolicy] = useState<"none" | "quarantine" | "reject">("none");
  const [subdomainPolicy, setSubdomainPolicy] = useState<"" | "none" | "quarantine" | "reject">("");
  const [pct, setPct] = useState(100);
  const [rua, setRua] = useState("");
  const [ruf, setRuf] = useState("");
  const [aspf, setAspf] = useState<"r" | "s">("r");
  const [adkim, setAdkim] = useState<"r" | "s">("r");
  const [record, setRecord] = useState("");

  const generate = () => {
    const r = process({ policy, subdomainPolicy: subdomainPolicy || undefined, pct, rua, ruf, aspf, adkim });
    if (r.success) setRecord(r.record!);
  };

  return (
    <div className="flex flex-col gap-5 p-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Domain Policy (p=)</Label>
          <Select value={policy} onValueChange={(v) => setPolicy(v as typeof policy)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">none — monitor only</SelectItem>
              <SelectItem value="quarantine">quarantine — send to spam</SelectItem>
              <SelectItem value="reject">reject — block failing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Subdomain Policy (sp=)</Label>
          <Select value={subdomainPolicy} onValueChange={(v) => setSubdomainPolicy(v as typeof subdomainPolicy)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Same as p=" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Same as p=</SelectItem>
              <SelectItem value="none">none</SelectItem>
              <SelectItem value="quarantine">quarantine</SelectItem>
              <SelectItem value="reject">reject</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Percentage (pct=): <span className="font-mono font-bold">{pct}%</span></Label>
        <Slider min={1} max={100} step={1} defaultValue={[pct]} onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setPct(arr[0] as number); }} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Aggregate Report URI (rua=)</Label>
        <Input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="mailto:dmarc@example.com" className="font-mono" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Forensic Report URI (ruf=)</Label>
        <Input value={ruf} onChange={(e) => setRuf(e.target.value)} placeholder="mailto:forensic@example.com" className="font-mono" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">SPF Alignment (aspf=)</Label>
          <Select value={aspf} onValueChange={(v) => setAspf(v as "r" | "s")}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="r">r — relaxed (default)</SelectItem>
              <SelectItem value="s">s — strict</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">DKIM Alignment (adkim=)</Label>
          <Select value={adkim} onValueChange={(v) => setAdkim(v as "r" | "s")}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="r">r — relaxed (default)</SelectItem>
              <SelectItem value="s">s — strict</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate}>Generate DMARC Record</Button>

      {record && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Generated DMARC Record</p>
            <CopyButton value={record} />
          </div>
          <code className="text-sm font-mono break-all">{record}</code>
          <p className="text-xs text-muted-foreground mt-2">Publish as a TXT record at <code className="font-mono">_dmarc.yourdomain.com</code></p>
        </div>
      )}
    </div>
  );
}
