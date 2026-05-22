"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type WordCountStats } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE = "The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.\n\nHow vexingly quick daft zebras jump!";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-2xl font-bold font-mono">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

export default function WordCountTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [stats, setStats] = useState<WordCountStats | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input });
    if (r.success) { setStats(r.stats!); setError(""); }
    else { setStats(null); setError(r.error!); }
  };

  const resetInput = (val: string) => { setInput(val); setStats(null); setError(""); };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setStats(null); setError(""); }}
          placeholder="Paste or type text to analyze..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-40 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={run} disabled={!input.trim()}>Count</Button>
        <Button size="sm" variant="outline" onClick={() => resetInput(SAMPLE)}>Sample</Button>
        <PasteButton onPaste={resetInput} />
        <ClearButton onClick={() => resetInput("")} />
      </div>
      {error && <ErrorDisplay message={error} />}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Characters" value={stats.characters.toLocaleString()} />
          <StatCard label="Words" value={stats.words.toLocaleString()} />
          <StatCard label="Lines" value={stats.lines.toLocaleString()} />
          <StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
          <StatCard label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
          <StatCard label="Unique Words" value={stats.uniqueWords.toLocaleString()} />
          <StatCard label="Avg Word Length" value={stats.avgWordLength} sub="characters" />
          <StatCard label="Reading Time" value={`~${stats.readingTimeMin} min`} sub="at 200 wpm" />
        </div>
      )}
    </div>
  );
}
