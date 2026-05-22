export interface CharcodeInput {
  input: string;
  mode: "encode" | "decode";
  base?: "decimal" | "hex" | "octal";
  delimiter?: "space" | "comma" | "newline";
}

export interface CharcodeOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): CharcodeOutput {
  const { input, mode, base = "decimal", delimiter = "space" } = params as CharcodeInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    const sep = delimiter === "comma" ? ", " : delimiter === "newline" ? "\n" : " ";
    if (mode === "encode") {
      const codes = Array.from(input).map((ch) => {
        const cp = ch.codePointAt(0)!;
        if (base === "hex") return "0x" + cp.toString(16);
        if (base === "octal") return cp.toString(8);
        return String(cp);
      });
      return { success: true, output: codes.join(sep) };
    } else {
      const parts = input.split(/[\s,]+/).filter(Boolean);
      const chars = parts.map((p) => {
        const trimmed = p.trim();
        let n: number;
        if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) n = parseInt(trimmed, 16);
        else if (base === "octal") n = parseInt(trimmed, 8);
        else n = parseInt(trimmed, 10);
        if (isNaN(n) || n < 0) throw new Error(`Invalid char code: "${trimmed}"`);
        return String.fromCodePoint(n);
      });
      return { success: true, output: chars.join("") };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
