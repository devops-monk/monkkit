"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "The quick brown fox\nThe lazy brown dog\nThe quick lazy cat";

export default function FindReplaceTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [globalFlag, setGlobalFlag] = useState(true);
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input, find, replace, useRegex, caseSensitive, global: globalFlag });
    if (r.success) { setOutput(r.output!); setCount(r.count!); setError(""); }
    else { setOutput(""); setCount(null); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setCount(null); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Find</Label>
          <Input value={find} onChange={(e) => setFind(e.target.value)} placeholder={useRegex ? "Regex pattern..." : "Find text..."} className="font-mono" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Replace</Label>
          <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replacement text..." className="font-mono" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim() || !find}>Replace</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        {count !== null && <span className="text-xs text-muted-foreground">{count} replacement{count !== 1 ? "s" : ""}</span>}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="regex" checked={useRegex} onCheckedChange={setUseRegex} />
            <Label htmlFor="regex" className="text-sm cursor-pointer">Regex</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="case" checked={caseSensitive} onCheckedChange={setCaseSensitive} />
            <Label htmlFor="case" className="text-sm cursor-pointer">Case</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="global" checked={globalFlag} onCheckedChange={setGlobalFlag} />
            <Label htmlFor="global" className="text-sm cursor-pointer">Global</Label>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter text..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Output appears here..." />
          </div>
        }
      />
    </div>
  );
}
