"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "ERROR: Connection refused\nINFO: Server started\nWARN: Low memory\nERROR: Timeout exceeded\nDEBUG: Request received\nINFO: Request processed";

export default function FilterLinesTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [pattern, setPattern] = useState("");
  const [mode, setMode] = useState<"include" | "exclude">("include");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input, pattern, mode, useRegex, caseSensitive });
    if (r.success) { setOutput(r.output!); setCount(r.matchCount!); setError(""); }
    else { setOutput(""); setCount(null); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setCount(null); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium whitespace-nowrap">Pattern</Label>
        <Input value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder={useRegex ? "Regex..." : "Search text..."} className="font-mono" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim() || !pattern}>Filter</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        {count !== null && <span className="text-xs text-muted-foreground">{count} lines</span>}
        <div className="ml-auto flex items-center gap-4">
          <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="include">Include</SelectItem>
              <SelectItem value="exclude">Exclude</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch id="regex" checked={useRegex} onCheckedChange={setUseRegex} />
            <Label htmlFor="regex" className="text-sm cursor-pointer">Regex</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="case" checked={caseSensitive} onCheckedChange={setCaseSensitive} />
            <Label htmlFor="case" className="text-sm cursor-pointer">Case</Label>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter text to filter..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Filtered output appears here..." />
          </div>
        }
      />
    </div>
  );
}
