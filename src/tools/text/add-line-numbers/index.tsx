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

const SAMPLE = "First line\nSecond line\nThird line\nFourth line";

export default function AddLineNumbersTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");
  const [start, setStart] = useState(1);
  const [separator, setSeparator] = useState(": ");
  const [padding, setPadding] = useState(true);

  const run = () => {
    const r = process({ input, start, separator, padding });
    if (r.success) { setOutput(r.output!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">Start</Label>
          <Input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} className="w-20 font-mono" min={0} />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground whitespace-nowrap">Separator</Label>
          <Input value={separator} onChange={(e) => setSeparator(e.target.value)} className="w-20 font-mono" />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="padding" checked={padding} onCheckedChange={setPadding} />
          <Label htmlFor="padding" className="text-sm cursor-pointer">Pad numbers</Label>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim()}>Add Numbers</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter text..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Numbered output appears here..." />
          </div>
        }
      />
    </div>
  );
}
