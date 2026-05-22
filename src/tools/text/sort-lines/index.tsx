"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

const SAMPLE = "banana\napple\ncherry\nmango\nblueberry\napple";

export default function SortLinesTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [unique, setUnique] = useState(false);
  const [natural, setNatural] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const run = () => {
    const r = process({ input, order, ignoreCase, unique, natural });
    if (r.success) { setOutput(r.output!); setCount(r.lineCount!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setCount(null); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim()}>Sort</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        {count !== null && <span className="text-xs text-muted-foreground">{count} lines</span>}
        <div className="ml-auto flex items-center gap-4">
          <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
            <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Switch id="case" checked={ignoreCase} onCheckedChange={setIgnoreCase} />
            <Label htmlFor="case" className="text-sm cursor-pointer">Ignore case</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="unique" checked={unique} onCheckedChange={setUnique} />
            <Label htmlFor="unique" className="text-sm cursor-pointer">Unique</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="natural" checked={natural} onCheckedChange={setNatural} />
            <Label htmlFor="natural" className="text-sm cursor-pointer">Natural sort</Label>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter lines to sort..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Sorted output appears here..." />
          </div>
        }
      />
    </div>
  );
}
