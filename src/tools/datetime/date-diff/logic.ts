export interface DateDiffInput {
  date1: string;
  date2: string;
}

export interface DateDiffInfo {
  totalMs: number;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  totalWeeks: number;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface DateDiffOutput {
  success: boolean;
  info?: DateDiffInfo;
  error?: string;
}

export function process(params: unknown): DateDiffOutput {
  const { date1, date2 } = params as DateDiffInput;
  if (!date1?.trim() || !date2?.trim()) return { success: false, error: "Both dates are required" };
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    if (isNaN(d1.getTime())) throw new Error("Invalid first date");
    if (isNaN(d2.getTime())) throw new Error("Invalid second date");
    const totalMs = Math.abs(d2.getTime() - d1.getTime());
    let start = d1 < d2 ? new Date(d1) : new Date(d2);
    const end = d1 < d2 ? new Date(d2) : new Date(d1);
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    return {
      success: true,
      info: {
        totalMs,
        totalSeconds: Math.floor(totalMs / 1000),
        totalMinutes: Math.floor(totalMs / 60000),
        totalHours: Math.floor(totalMs / 3600000),
        totalDays: Math.floor(totalMs / 86400000),
        totalWeeks: Math.floor(totalMs / 604800000),
        years,
        months,
        days,
        hours: end.getHours() - start.getHours(),
        minutes: end.getMinutes() - start.getMinutes(),
        seconds: end.getSeconds() - start.getSeconds(),
      }
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
