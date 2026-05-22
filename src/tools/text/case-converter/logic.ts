export type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab" | "constant" | "dot" | "alternating" | "inverse";

export interface CaseConverterInput {
  input: string;
  caseType: CaseType;
}

export interface CaseConverterOutput {
  success: boolean;
  output?: string;
  error?: string;
}

function toWords(s: string): string[] {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[-_\.]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function process(params: unknown): CaseConverterOutput {
  const { input, caseType } = params as CaseConverterInput;
  if (!input) return { success: false, error: "Input is empty" };
  try {
    let out: string;
    const words = toWords(input);
    switch (caseType) {
      case "upper": out = input.toUpperCase(); break;
      case "lower": out = input.toLowerCase(); break;
      case "title": out = words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" "); break;
      case "sentence":
        out = input.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (m) => m.toUpperCase());
        break;
      case "camel": out = words.map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join(""); break;
      case "pascal": out = words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(""); break;
      case "snake": out = words.map((w) => w.toLowerCase()).join("_"); break;
      case "kebab": out = words.map((w) => w.toLowerCase()).join("-"); break;
      case "constant": out = words.map((w) => w.toUpperCase()).join("_"); break;
      case "dot": out = words.map((w) => w.toLowerCase()).join("."); break;
      case "alternating": out = input.split("").map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(""); break;
      case "inverse": out = input.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(""); break;
      default: out = input;
    }
    return { success: true, output: out };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
