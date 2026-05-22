"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

export default function MacLookupTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [formatted, setFormatted] = useState<Record<string, string> | null>(null);
  const [oui, setOui] = useState("");
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input });
    if (r.success) { setFormatted(r.formatted!); setOui(r.oui!); setError(""); }
    else { setFormatted(null); setError(r.error!); }
  };

  const SAMPLES = ["AA:BB:CC:DD:EE:FF", "00-1A-2B-3C-4D-5E", "001A.2B3C.4D5E"];

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => { setInput(e.target.value); setFormatted(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter MAC address (any format)..."
          className="font-mono"
        />
        <Button onClick={run} disabled={!input.trim()}>Format</Button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {SAMPLES.map((s) => (
          <button key={s} onClick={() => setInput(s)} className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 font-mono">{s}</button>
        ))}
      </div>
      {error && <ErrorDisplay message={error} />}
      {formatted && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Formats</p>
            <span className="text-xs text-muted-foreground">OUI: <code className="font-mono">{oui}</code></span>
          </div>
          {Object.entries(formatted).map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-foreground">{value}</code>
                <CopyButton value={value} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
