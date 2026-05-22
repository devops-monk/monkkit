import type { ToolDefinition } from "@/types/registry";

export const datetimeTools: ToolDefinition[] = [
  {
    id: "datetime-unix-timestamp",
    slug: "unix-timestamp",
    name: "Unix Timestamp Converter",
    shortDescription: "Convert Unix timestamps to human-readable dates and vice versa.",
    description: "Convert Unix timestamps (seconds or milliseconds) to readable date/time formats, or convert date strings to Unix timestamps. Shows UTC, local time, ISO 8601, and relative time.",
    category: "datetime",
    tags: ["unix", "timestamp", "epoch", "date", "time", "convert"],
    keywords: ["unix timestamp converter online", "epoch to date", "timestamp to human readable"],
    icon: "Clock",
    status: "new",
    component: () => import("@/tools/datetime/unix-timestamp"),
    process: (input) => import("@/tools/datetime/unix-timestamp/logic").then((m) => m.process(input)),
  },
  {
    id: "datetime-date-diff",
    slug: "date-diff",
    name: "Date Difference Calculator",
    shortDescription: "Calculate the exact difference between two dates.",
    description: "Calculate the difference between two dates in years, months, days, hours, minutes, and seconds. Also shows total days, hours, minutes, and weeks.",
    category: "datetime",
    tags: ["date", "difference", "duration", "time", "calculate", "days"],
    keywords: ["date difference calculator online", "days between dates", "date duration calculator"],
    icon: "CalendarDays",
    status: "new",
    component: () => import("@/tools/datetime/date-diff"),
    process: (input) => import("@/tools/datetime/date-diff/logic").then((m) => m.process(input)),
  },
];
