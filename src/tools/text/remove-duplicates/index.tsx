"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

const SAMPLE = "apple\nBanana\napple\ncherry\nbanana\nAPPLE\n\ncherry";

export default function RemoveDuplicatesTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [removed, setRemoved] = useState<number | null>(null);

  const run = () => {
    const r = process({ input, ignoreCase, trimLines, removeEmpty });
    if (r.success) { setOutput(r.output!); setRemoved(r.removed!); setError(""); }
    else { setOutput(""); setRemoved(null); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setRemoved(null); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim()}>Remove Duplicates</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        {removed !== null && <span className="text-xs text-muted-foreground">{removed} duplicate{removed !== 1 ? "s" : ""} removed</span>}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="case" checked={ignoreCase} onCheckedChange={setIgnoreCase} />
            <Label htmlFor="case" className="text-sm cursor-pointer">Ignore case</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="trim" checked={trimLines} onCheckedChange={setTrimLines} />
            <Label htmlFor="trim" className="text-sm cursor-pointer">Trim</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="empty" checked={removeEmpty} onCheckedChange={setRemoveEmpty} />
            <Label htmlFor="empty" className="text-sm cursor-pointer">Remove empty</Label>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter lines with duplicates..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Unique lines appear here..." />
          </div>
        }
      />
    </div>
  );
}
