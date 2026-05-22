"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "Hello";

export default function CharcodeTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");
  const [base, setBase] = useState<"decimal" | "hex" | "octal">("decimal");
  const [delimiter, setDelimiter] = useState<"space" | "comma" | "newline">("space");

  const run = (mode: "encode" | "decode") => {
    const r = process({ input, mode, base, delimiter });
    if (r.success) { setOutput(r.output!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => run("encode")} disabled={!input.trim()}>To Charcode</Button>
        <Button size="sm" variant="outline" onClick={() => run("decode")} disabled={!input.trim()}>From Charcode</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Base</Label>
            <Select value={base} onValueChange={(v) => setBase(v as typeof base)}>
              <SelectTrigger className="h-8 w-24 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="decimal">Decimal</SelectItem>
                <SelectItem value="hex">Hex</SelectItem>
                <SelectItem value="octal">Octal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">Delimiter</Label>
            <Select value={delimiter} onValueChange={(v) => setDelimiter(v as typeof delimiter)}>
              <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="space">Space</SelectItem>
                <SelectItem value="comma">Comma</SelectItem>
                <SelectItem value="newline">Newline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter text or char codes..." />}
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
