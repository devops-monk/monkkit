export interface SortLinesInput {
  input: string;
  order?: "asc" | "desc";
  ignoreCase?: boolean;
  unique?: boolean;
  reverse?: boolean;
  natural?: boolean;
}

export interface SortLinesOutput {
  success: boolean;
  output?: string;
  lineCount?: number;
  error?: string;
}

export function process(params: unknown): SortLinesOutput {
  const { input, order = "asc", ignoreCase = false, unique = false, natural = false } = params as SortLinesInput;
  if (!input) return { success: false, error: "Input is empty" };
  let lines = input.split("\n");
  if (unique) lines = [...new Set(lines.map((l) => (ignoreCase ? l.toLowerCase() : l)))].map((l) => l);
  lines.sort((a, b) => {
    const la = ignoreCase ? a.toLowerCase() : a;
    const lb = ignoreCase ? b.toLowerCase() : b;
    if (natural) return la.localeCompare(lb, undefined, { numeric: true, sensitivity: ignoreCase ? "base" : "variant" });
    return la < lb ? -1 : la > lb ? 1 : 0;
  });
  if (order === "desc") lines.reverse();
  return { success: true, output: lines.join("\n"), lineCount: lines.length };
}
