"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClearButton } from "@/components/tool-ui/ClearButton";
import { PasteButton } from "@/components/tool-ui/PasteButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process } from "./logic";
import type { DiffLine, WordSpan } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

const SAMPLE_LEFT = `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
The five boxing wizards jump quickly.
Sphinx of black quartz, judge my vow.`;

const SAMPLE_RIGHT = `The quick brown fox leaps over the lazy cat.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump!
The five boxing wizards jumped quickly.
Waltz, bad nymph, for quick jigs vex.
Sphinx of black quartz, judge my vow.`;

const NUM_COLORS: Record<string, string> = {
  added: "text-green-600 dark:text-green-400",
  removed: "text-red-600 dark:text-red-400",
  changed: "text-yellow-600 dark:text-yellow-400",
  unchanged: "text-muted-foreground",
};

function InlineSpans({ spans }: { spans: WordSpan[] }) {
  return (
    <>
      {spans.map((s, i) =>
        s.type === "removed" ? (
          <mark key={i} className="bg-red-400/40 dark:bg-red-500/40 text-inherit rounded-sm">{s.text}</mark>
        ) : s.type === "added" ? (
          <mark key={i} className="bg-green-400/40 dark:bg-green-500/40 text-inherit rounded-sm">{s.text}</mark>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}

function SideBySideRow({ line }: { line: DiffLine }) {
  const isAdded = line.type === "added";
  const isRemoved = line.type === "removed";
  const isChanged = line.type === "changed";

  const leftBg = isAdded ? "bg-muted/10" : isRemoved ? "bg-red-500/10 border-l-2 border-red-500" : isChanged ? "bg-red-500/10 border-l-2 border-red-500" : "";
  const rightBg = isRemoved ? "bg-muted/10" : isAdded ? "bg-green-500/10 border-l-2 border-green-500" : isChanged ? "bg-green-500/10 border-l-2 border-green-500" : "";

  return (
    <div className="grid grid-cols-2 divide-x divide-border/40 text-xs font-mono">
      <div className={`flex gap-2 px-2 py-0.5 min-h-[1.5rem] ${leftBg}`}>
        <span className={`w-7 shrink-0 select-none text-right ${isAdded ? "text-muted-foreground/30" : NUM_COLORS[line.type]}`}>
          {line.leftNum ?? ""}
        </span>
        <span className="whitespace-pre-wrap break-all">
          {isAdded ? (
            <span className="opacity-0 select-none"> </span>
          ) : isChanged && line.leftSpans ? (
            <InlineSpans spans={line.leftSpans} />
          ) : (
            line.leftLine ?? ""
          )}
        </span>
      </div>
      <div className={`flex gap-2 px-2 py-0.5 min-h-[1.5rem] ${rightBg}`}>
        <span className={`w-7 shrink-0 select-none text-right ${isRemoved ? "text-muted-foreground/30" : NUM_COLORS[line.type]}`}>
          {line.rightNum ?? ""}
        </span>
        <span className="whitespace-pre-wrap break-all">
          {isRemoved ? (
            <span className="opacity-0 select-none"> </span>
          ) : isChanged && line.rightSpans ? (
            <InlineSpans spans={line.rightSpans} />
          ) : (
            line.rightLine ?? ""
          )}
        </span>
      </div>
    </div>
  );
}

function UnifiedRow({ line }: { line: DiffLine }) {
  const isChanged = line.type === "changed";
  const colors = {
    added: "bg-green-500/10 border-l-2 border-green-500",
    removed: "bg-red-500/10 border-l-2 border-red-500",
    changed: "bg-yellow-500/10 border-l-2 border-yellow-500",
    unchanged: "",
  };
  const prefix = { added: "+", removed: "-", changed: "~", unchanged: " " };

  return (
    <>
      {isChanged ? (
        <>
          <div className={`flex gap-2 px-2 py-0.5 text-xs font-mono min-h-[1.5rem] bg-red-500/10 border-l-2 border-red-500`}>
            <span className={`w-7 shrink-0 text-right select-none ${NUM_COLORS.removed}`}>{line.leftNum ?? ""}</span>
            <span className="w-3 shrink-0 select-none">-</span>
            <span className="whitespace-pre-wrap break-all">
              {line.leftSpans ? <InlineSpans spans={line.leftSpans} /> : line.leftLine}
            </span>
          </div>
          <div className={`flex gap-2 px-2 py-0.5 text-xs font-mono min-h-[1.5rem] bg-green-500/10 border-l-2 border-green-500`}>
            <span className={`w-7 shrink-0 text-right select-none ${NUM_COLORS.added}`}>{line.rightNum ?? ""}</span>
            <span className="w-3 shrink-0 select-none">+</span>
            <span className="whitespace-pre-wrap break-all">
              {line.rightSpans ? <InlineSpans spans={line.rightSpans} /> : line.rightLine}
            </span>
          </div>
        </>
      ) : (
        <div className={`flex gap-2 px-2 py-0.5 text-xs font-mono min-h-[1.5rem] ${colors[line.type]}`}>
          <span className={`w-7 shrink-0 text-right select-none ${NUM_COLORS[line.type]}`}>
            {line.leftNum ?? line.rightNum ?? ""}
          </span>
          <span className="w-3 shrink-0 select-none">{prefix[line.type]}</span>
          <span className="whitespace-pre-wrap break-all">
            {line.type === "removed" ? line.leftLine : line.rightLine}
          </span>
        </div>
      )}
    </>
  );
}

export default function TextDiff({ toolMeta: _ }: ToolComponentProps) {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [result, setResult] = useState<ReturnType<typeof process> | null>(null);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [view, setView] = useState<"split" | "unified">("split");
  const [showUnchanged, setShowUnchanged] = useState(true);

  const handleCompare = () => setResult(process({ left, right, ignoreWhitespace, ignoreCase }));
  const handleClear = () => { setLeft(""); setRight(""); setResult(null); };
  const loadSample = () => { setLeft(SAMPLE_LEFT); setRight(SAMPLE_RIGHT); setResult(null); };
  const resetResult = () => setResult(null);

  const lines = result?.lines?.filter((l) => showUnchanged || l.type !== "unchanged") ?? [];

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={handleCompare} disabled={!left && !right}>
          Compare
        </Button>
        <Button size="sm" variant="outline" onClick={loadSample}>
          Sample
        </Button>
        <PasteButton onPaste={(v) => { setLeft(v); resetResult(); }} label="Paste Left" />
        <ClearButton onClick={handleClear} />
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer ml-1">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => { setIgnoreWhitespace(e.target.checked); resetResult(); }}
            className="rounded"
          />
          Ignore whitespace
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => { setIgnoreCase(e.target.checked); resetResult(); }}
            className="rounded"
          />
          Ignore case
        </label>
      </div>

      {result?.error && <ErrorDisplay message={result.error} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium px-1">Original</span>
          <textarea
            value={left}
            onChange={(e) => { setLeft(e.target.value); resetResult(); }}
            placeholder="Paste original text…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground font-medium px-1">Modified</span>
          <textarea
            value={right}
            onChange={(e) => { setRight(e.target.value); resetResult(); }}
            placeholder="Paste modified text…"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm h-48 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      {result?.success && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-green-600 dark:text-green-400 font-medium">+{result.addedCount} added</span>
            <span className="text-red-600 dark:text-red-400 font-medium">−{result.removedCount} removed</span>
            <span className="text-muted-foreground">{result.unchangedCount} unchanged</span>
            <div className="ml-auto flex items-center gap-1">
              <button
                className={`px-2 py-0.5 rounded text-xs border ${view === "split" ? "bg-muted border-border" : "border-transparent text-muted-foreground"}`}
                onClick={() => setView("split")}
              >
                Split
              </button>
              <button
                className={`px-2 py-0.5 rounded text-xs border ${view === "unified" ? "bg-muted border-border" : "border-transparent text-muted-foreground"}`}
                onClick={() => setView("unified")}
              >
                Unified
              </button>
              <button
                className="px-2 py-0.5 rounded text-xs text-muted-foreground underline underline-offset-2 ml-1"
                onClick={() => setShowUnchanged((v) => !v)}
              >
                {showUnchanged ? "Hide unchanged" : "Show unchanged"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-background overflow-auto max-h-[500px]">
            {view === "split" && (
              <div className="grid grid-cols-2 divide-x divide-border/40 text-xs font-mono border-b border-border/50 bg-muted/30 px-2 py-1">
                <span className="text-muted-foreground font-medium px-1">Original</span>
                <span className="text-muted-foreground font-medium px-3">Modified</span>
              </div>
            )}
            <div className="divide-y divide-border/20">
              {lines.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  {result.addedCount === 0 && result.removedCount === 0
                    ? "No differences — texts are identical"
                    : "All differences hidden — click \"Show unchanged\""}
                </p>
              ) : view === "split" ? (
                lines.map((line, i) => <SideBySideRow key={i} line={line} />)
              ) : (
                lines.map((line, i) => <UnifiedRow key={i} line={line} />)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
