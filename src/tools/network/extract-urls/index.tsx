"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = `Check out https://example.com and https://google.com/search?q=test
Also see http://github.com/gchq/CyberChef for tools.`;

export default function ExtractUrlsTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [unique, setUnique] = useState(true);

  const run = () => {
    const r = process({ input, unique });
    if (r.success) {
      setOutput(r.urls!.join("\n"));
      setCount(r.count!);
      setError("");
    } else {
      setOutput("");
      setCount(null);
      setError(r.error!);
    }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setCount(null); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim()}>Extract URLs</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        {count !== null && <span className="text-xs text-muted-foreground">{count} URL{count !== 1 ? "s" : ""} found</span>}
        <div className="ml-auto flex items-center gap-2">
          <Switch id="unique" checked={unique} onCheckedChange={setUnique} />
          <Label htmlFor="unique" className="text-sm cursor-pointer">Unique</Label>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Paste text containing URLs..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Extracted URLs appear here..." />
          </div>
        }
      />
    </div>
  );
}
