export interface RemoveDuplicatesInput {
  input: string;
  ignoreCase?: boolean;
  trimLines?: boolean;
  removeEmpty?: boolean;
}

export interface RemoveDuplicatesOutput {
  success: boolean;
  output?: string;
  removed?: number;
  error?: string;
}

export function process(params: unknown): RemoveDuplicatesOutput {
  const { input, ignoreCase = false, trimLines = false, removeEmpty = false } = params as RemoveDuplicatesInput;
  if (!input) return { success: false, error: "Input is empty" };
  let lines = input.split("\n");
  if (trimLines) lines = lines.map((l) => l.trim());
  if (removeEmpty) lines = lines.filter((l) => l.trim().length > 0);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    const key = ignoreCase ? line.toLowerCase() : line;
    if (!seen.has(key)) { seen.add(key); unique.push(line); }
  }
  return { success: true, output: unique.join("\n"), removed: lines.length - unique.length };
}
