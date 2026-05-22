"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "Hello, World!";

export default function XorTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("secret");
  const [keyType, setKeyType] = useState<"utf8" | "hex" | "decimal">("utf8");
  const [outputType, setOutputType] = useState<"hex" | "utf8">("hex");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input, key, keyType, outputType });
    if (r.success) { setOutput(r.output!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium whitespace-nowrap">Key</Label>
        <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter XOR key..." className="font-mono max-w-xs" />
        <Select value={keyType} onValueChange={(v) => setKeyType(v as typeof keyType)}>
          <SelectTrigger className="h-9 w-28 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="utf8">UTF-8</SelectItem>
            <SelectItem value="hex">Hex</SelectItem>
            <SelectItem value="decimal">Decimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim() || !key.trim()}>XOR</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        <div className="ml-auto flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Output</Label>
          <Select value={outputType} onValueChange={(v) => setOutputType(v as typeof outputType)}>
            <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">Hex</SelectItem>
              <SelectItem value="utf8">UTF-8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter text to XOR..." />}
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
