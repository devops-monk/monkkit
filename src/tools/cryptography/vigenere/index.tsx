"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "Attack at dawn";

export default function VigenereTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [key, setKey] = useState("SECRET");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");

  const run = (mode: "encode" | "decode") => {
    const r = process({ input, key, mode });
    if (r.success) { setOutput(r.output!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium whitespace-nowrap">Key</Label>
        <Input value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} placeholder="Enter key (letters only)..." className="font-mono max-w-xs" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => run("encode")} disabled={!input.trim() || !key.trim()}>Encrypt</Button>
        <Button size="sm" variant="outline" onClick={() => run("decode")} disabled={!input.trim() || !key.trim()}>Decrypt</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Enter text to encrypt/decrypt..." />}
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
