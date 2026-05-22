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

const SAMPLE = `Server logs:
192.168.1.1 - GET /index.html
10.0.0.1 connected from 203.0.113.42
Failed login from 198.51.100.7 and 8.8.8.8`;

export default function ExtractIpsTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [includeIPv6, setIncludeIPv6] = useState(true);
  const [unique, setUnique] = useState(true);

  const run = () => {
    const r = process({ input, includeIPv6, unique });
    if (r.success) {
      setOutput(r.ips!.join("\n"));
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
        <Button size="sm" onClick={run} disabled={!input.trim()}>Extract IPs</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
        {count !== null && <span className="text-xs text-muted-foreground">{count} IP{count !== 1 ? "s" : ""} found</span>}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="ipv6" checked={includeIPv6} onCheckedChange={setIncludeIPv6} />
            <Label htmlFor="ipv6" className="text-sm cursor-pointer">IPv6</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="unique" checked={unique} onCheckedChange={setUnique} />
            <Label htmlFor="unique" className="text-sm cursor-pointer">Unique</Label>
          </div>
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="Paste text containing IP addresses..." />}
        right={
          <div className="relative h-full">
            <div className="absolute top-2 right-2 z-10"><CopyButton value={output} /></div>
            <CodeEditor key={outputKey} value={output} readOnly language="plaintext" placeholder="Extracted IPs appear here..." />
          </div>
        }
      />
    </div>
  );
}
