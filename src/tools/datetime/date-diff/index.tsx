"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDisplay } from "@/components/tool-ui/ErrorDisplay";
import { process, type DateDiffInfo } from "./logic";
import type { ToolComponentProps } from "@/types/registry";

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl font-bold font-mono">{value.toLocaleString()}</span>
      <span className="text-xs text-muted-foreground">{unit}</span>
    </div>
  );
}

export default function DateDiffTool({ toolMeta: _ }: ToolComponentProps) {
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [info, setInfo] = useState<DateDiffInfo | null>(null);
  const [error, setError] = useState("");

  const run = () => {
    const r = process({ date1, date2 });
    if (r.success) { setInfo(r.info!); setError(""); }
    else { setInfo(null); setError(r.error!); }
  };

  const useNow = (which: 1 | 2) => {
    const now = new Date().toISOString().slice(0, 16);
    if (which === 1) setDate1(now); else setDate2(now);
    setInfo(null);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Start Date</Label>
          <div className="flex gap-1">
            <Input type="datetime-local" value={date1} onChange={(e) => { setDate1(e.target.value); setInfo(null); }} className="font-mono text-xs" />
            <Button variant="outline" size="sm" onClick={() => useNow(1)}>Now</Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">End Date</Label>
          <div className="flex gap-1">
            <Input type="datetime-local" value={date2} onChange={(e) => { setDate2(e.target.value); setInfo(null); }} className="font-mono text-xs" />
            <Button variant="outline" size="sm" onClick={() => useNow(2)}>Now</Button>
          </div>
        </div>
      </div>
      <Button onClick={run} disabled={!date1 || !date2} className="w-fit">Calculate Difference</Button>
      {error && <ErrorDisplay message={error} />}
      {info && (
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Duration</p>
            <p className="text-lg font-mono">
              {info.years > 0 && <span>{info.years}y </span>}
              {info.months > 0 && <span>{info.months}mo </span>}
              {info.days > 0 && <span>{info.days}d </span>}
              {info.hours !== 0 && <span>{Math.abs(info.hours)}h </span>}
              {info.minutes !== 0 && <span>{Math.abs(info.minutes)}m </span>}
              {info.seconds !== 0 && <span>{Math.abs(info.seconds)}s</span>}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Days" value={info.totalDays} unit="days" />
            <StatCard label="Total Hours" value={info.totalHours} unit="hours" />
            <StatCard label="Total Minutes" value={info.totalMinutes} unit="minutes" />
            <StatCard label="Total Seconds" value={info.totalSeconds} unit="seconds" />
            <StatCard label="Total Weeks" value={info.totalWeeks} unit="weeks" />
            <StatCard label="Milliseconds" value={info.totalMs} unit="ms" />
          </div>
        </div>
      )}
    </div>
  );
}
