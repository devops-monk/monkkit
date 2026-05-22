export interface UnixTimestampInput {
  input: string;
  mode: "toDate" | "toUnix";
  unit?: "seconds" | "milliseconds";
}

export interface TimestampInfo {
  unix: number;
  unixMs: number;
  utc: string;
  local: string;
  iso8601: string;
  relative: string;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
}

export interface UnixTimestampOutput {
  success: boolean;
  info?: TimestampInfo;
  error?: string;
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
}

function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.valueOf() - start.valueOf()) / 86400000);
}

function getRelative(ms: number): string {
  const diff = Date.now() - ms;
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? " ago" : " from now";
  if (abs < 60000) return "just now";
  if (abs < 3600000) return `${Math.floor(abs / 60000)} minute${Math.floor(abs / 60000) !== 1 ? "s" : ""}${suffix}`;
  if (abs < 86400000) return `${Math.floor(abs / 3600000)} hour${Math.floor(abs / 3600000) !== 1 ? "s" : ""}${suffix}`;
  if (abs < 2592000000) return `${Math.floor(abs / 86400000)} day${Math.floor(abs / 86400000) !== 1 ? "s" : ""}${suffix}`;
  return `${Math.floor(abs / 2592000000)} month${Math.floor(abs / 2592000000) !== 1 ? "s" : ""}${suffix}`;
}

function buildInfo(ms: number): TimestampInfo {
  const d = new Date(ms);
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    unix: Math.floor(ms / 1000),
    unixMs: ms,
    utc: d.toUTCString(),
    local: d.toString(),
    iso8601: d.toISOString(),
    relative: getRelative(ms),
    dayOfWeek: DAYS[d.getUTCDay()],
    dayOfYear: getDayOfYear(d),
    weekNumber: getWeekNumber(d),
  };
}

export function process(params: unknown): UnixTimestampOutput {
  const { input, mode, unit = "seconds" } = params as UnixTimestampInput;
  const trimmed = input?.trim();
  if (!trimmed) return { success: false, error: "Input is empty" };
  try {
    if (mode === "toDate") {
      const n = Number(trimmed);
      if (isNaN(n)) throw new Error("Not a valid number");
      const ms = unit === "milliseconds" ? n : n * 1000;
      return { success: true, info: buildInfo(ms) };
    } else {
      const d = new Date(trimmed);
      if (isNaN(d.getTime())) throw new Error("Could not parse date string");
      return { success: true, info: buildInfo(d.getTime()) };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
