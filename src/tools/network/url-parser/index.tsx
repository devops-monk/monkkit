"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type ParsedUrl } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[120px]">{label}</span>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <code className="text-sm font-mono break-all text-foreground flex-1">{value}</code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

const SAMPLE = "https://user:pass@example.com:8080/path/to/page?q=hello&page=1#section";

export default function UrlParserTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input });
    if (r.success) { setParsed(r.parsed!); setError(""); }
    else { setParsed(null); setError(r.error!); }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => { setInput(e.target.value); setParsed(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter a URL to parse..."
          className="font-mono"
        />
        <Button onClick={run} disabled={!input.trim()}>Parse</Button>
      </div>
      <button onClick={() => setInput(SAMPLE)} className="text-xs text-muted-foreground hover:text-foreground underline text-left">Load sample URL</button>
      {error && <ErrorDisplay message={error} />}
      {parsed && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">URL Components</p>
            <Row label="Protocol" value={parsed.protocol} />
            <Row label="Origin" value={parsed.origin} />
            <Row label="Username" value={parsed.username} />
            <Row label="Password" value={parsed.password} />
            <Row label="Hostname" value={parsed.hostname} />
            <Row label="Port" value={parsed.port} />
            <Row label="Path" value={parsed.pathname} />
            <Row label="Query String" value={parsed.search} />
            <Row label="Hash / Fragment" value={parsed.hash} />
          </div>
          {Object.keys(parsed.queryParams).length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Query Parameters</p>
              {Object.entries(parsed.queryParams).map(([key, values]) => (
                <div key={key} className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
                  <code className="text-sm font-mono text-blue-500">{key}</code>
                  <code className="text-sm font-mono text-foreground">{values.join(", ")}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
