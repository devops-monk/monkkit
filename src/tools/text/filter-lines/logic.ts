export interface FilterLinesInput {
  input: string;
  pattern: string;
  mode?: "include" | "exclude";
  useRegex?: boolean;
  caseSensitive?: boolean;
}

export interface FilterLinesOutput {
  success: boolean;
  output?: string;
  matchCount?: number;
  error?: string;
}

export function process(params: unknown): FilterLinesOutput {
  const { input, pattern, mode = "include", useRegex = false, caseSensitive = true } = params as FilterLinesInput;
  if (!input) return { success: false, error: "Input is empty" };
  if (!pattern) return { success: false, error: "Pattern is empty" };
  try {
    const flags = caseSensitive ? "" : "i";
    const re = new RegExp(useRegex ? pattern : pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
    const lines = input.split("\n");
    const filtered = lines.filter((l) => (mode === "include" ? re.test(l) : !re.test(l)));
    return { success: true, output: filtered.join("\n"), matchCount: filtered.length };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
