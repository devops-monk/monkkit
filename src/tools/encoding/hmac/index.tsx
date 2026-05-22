"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type HmacAlgo } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "The quick brown fox jumps over the lazy dog";
const ALGOS: HmacAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

export default function HmacTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("secret");
  const [algorithm, setAlgorithm] = useState<HmacAlgo>("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    const r = await process({ input, key, algorithm, uppercase });
    if (r.success) { setOutput(r.output!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setLoading(false);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setError(""); };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Input</Label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setOutput(""); setError(""); }}
          placeholder="Enter text to generate HMAC..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Key</Label>
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter secret key..." className="font-mono" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim() || !key || loading}>
          Generate HMAC
        </Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        <div className="ml-auto flex items-center gap-4">
          <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as HmacAlgo)}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALGOS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
            <Label htmlFor="uppercase" className="text-sm cursor-pointer">Uppercase</Label>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      {output && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HMAC-{algorithm}</span>
            <CopyButton value={output} />
          </div>
          <code className="text-sm font-mono break-all text-foreground">{output}</code>
        </div>
      )}
    </div>
  );
}
