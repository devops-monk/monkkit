"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type TimestampInfo } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

function InfoRow({ label, value }: { label: string; value: string | number }) {
  const v = String(value);
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[160px]">{label}</span>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <code className="text-sm font-mono break-all text-foreground flex-1">{v}</code>
        <CopyButton value={v} />
      </div>
    </div>
  );
}

export default function UnixTimestampTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"toDate" | "toUnix">("toDate");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [info, setInfo] = useState<TimestampInfo | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ input, mode, unit });
    if (r.success) { setInfo(r.info!); setError(""); }
    else { setInfo(null); setError(r.error!); }
  };

  const useNow = () => {
    const now = mode === "toDate"
      ? String(unit === "milliseconds" ? Date.now() : Math.floor(Date.now() / 1000))
      : new Date().toISOString();
    setInput(now);
    const r = process({ input: now, mode, unit });
    if (r.success) { setInfo(r.info!); setError(""); }
    else { setInfo(null); setError(r.error!); }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="flex gap-2 flex-wrap">
        <Select value={mode} onValueChange={(v) => { setMode(v as typeof mode); setInfo(null); setError(""); }}>
          <SelectTrigger className="h-9 w-44 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="toDate">Timestamp → Date</SelectItem>
            <SelectItem value="toUnix">Date → Timestamp</SelectItem>
          </SelectContent>
        </Select>
        {mode === "toDate" && (
          <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
            <SelectTrigger className="h-9 w-36 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="seconds">Seconds</SelectItem>
              <SelectItem value="milliseconds">Milliseconds</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => { setInput(e.target.value); setInfo(null); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={mode === "toDate" ? "Enter Unix timestamp..." : "Enter date string (e.g. 2024-01-15T10:30:00Z)"}
          className="font-mono"
        />
        <Button onClick={run} disabled={!input.trim()}>Convert</Button>
        <Button variant="outline" onClick={useNow}>Now</Button>
      </div>
      {error && <ErrorDisplay message={error} />}
      {info && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Converted</p>
          <InfoRow label="Unix (seconds)" value={info.unix} />
          <InfoRow label="Unix (milliseconds)" value={info.unixMs} />
          <InfoRow label="ISO 8601" value={info.iso8601} />
          <InfoRow label="UTC" value={info.utc} />
          <InfoRow label="Local" value={info.local} />
          <InfoRow label="Relative" value={info.relative} />
          <InfoRow label="Day of Week" value={info.dayOfWeek} />
          <InfoRow label="Day of Year" value={info.dayOfYear} />
          <InfoRow label="Week Number" value={info.weekNumber} />
        </div>
      )}
    </div>
  );
}
