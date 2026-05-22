export interface AddLineNumbersInput {
  input: string;
  start?: number;
  separator?: string;
  padding?: boolean;
}

export interface AddLineNumbersOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): AddLineNumbersOutput {
  const { input, start = 1, separator = ": ", padding = true } = params as AddLineNumbersInput;
  if (!input) return { success: false, error: "Input is empty" };
  const lines = input.split("\n");
  const maxNum = start + lines.length - 1;
  const width = padding ? String(maxNum).length : 0;
  const out = lines.map((line, i) => {
    const num = String(i + start).padStart(width, " ");
    return `${num}${separator}${line}`;
  }).join("\n");
  return { success: true, output: out };
}
