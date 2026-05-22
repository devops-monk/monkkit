"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/tool-ui/CodeEditor";
import { SplitPane } from "@/components/tool-ui/SplitPane";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type CaseType } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const CASES: { value: CaseType; label: string }[] = [
  { value: "upper", label: "UPPER CASE" },
  { value: "lower", label: "lower case" },
  { value: "title", label: "Title Case" },
  { value: "sentence", label: "Sentence case" },
  { value: "camel", label: "camelCase" },
  { value: "pascal", label: "PascalCase" },
  { value: "snake", label: "snake_case" },
  { value: "kebab", label: "kebab-case" },
  { value: "constant", label: "CONSTANT_CASE" },
  { value: "dot", label: "dot.case" },
  { value: "alternating", label: "aLtErNaTiNg" },
  { value: "inverse", label: "iNVERSE" },
];

const SAMPLE = "The quick brown fox jumps over the lazy dog";

export default function CaseConverterTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [outputKey, setOutputKey] = useState(0);
  const [error, setError] = useState("");
  const [activeCase, setActiveCase] = useState<CaseType>("upper");

  const run = (ct: CaseType) => {
    setActiveCase(ct);
    const r = process({ input, caseType: ct });
    if (r.success) { setOutput(r.output!); setError(""); }
    else { setOutput(""); setError(r.error!); }
    setOutputKey((k) => k + 1);
  };

  const resetInput = (val: string) => { setInput(val); setOutput(""); setError(""); };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap gap-1.5">
        {CASES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => input.trim() && run(value)}
            disabled={!input.trim()}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors font-mono ${
              activeCase === value && output
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => resetInput(SAMPLE)} className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">Sample</button>
          <PasteButton onPaste={resetInput} />
          <ClearButton onClick={() => resetInput("")} />
        </div>
      </div>
      {error && <ErrorDisplay message={error} />}
      <SplitPane
        left={<CodeEditor value={input} onChange={(v) => { setInput(v); if (v.trim()) run(activeCase); else { setOutput(""); } }} language="plaintext" placeholder="Enter text to convert..." />}
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
