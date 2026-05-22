export interface ReverseInput {
  input: string;
  mode?: "chars" | "words" | "lines";
}

export interface ReverseOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): ReverseOutput {
  const { input, mode = "chars" } = params as ReverseInput;
  if (!input) return { success: false, error: "Input is empty" };
  let out: string;
  if (mode === "lines") {
    out = input.split("\n").reverse().join("\n");
  } else if (mode === "words") {
    out = input.split(/(\s+)/).reverse().join("");
  } else {
    out = [...input].reverse().join("");
  }
  return { success: true, output: out };
}
