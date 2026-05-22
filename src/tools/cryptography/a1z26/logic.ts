export interface A1Z26Input {
  input: string;
  mode: "encode" | "decode";
  delimiter?: string;
}

export interface A1Z26Output {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): A1Z26Output {
  const { input, mode, delimiter = "-" } = params as A1Z26Input;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    if (mode === "encode") {
      const out = input.toUpperCase().split("").map((ch) => {
        if (ch === " ") return " ";
        const n = ch.charCodeAt(0) - 64;
        if (n < 1 || n > 26) return ch;
        return String(n);
      }).join(delimiter);
      return { success: true, output: out };
    } else {
      const sep = delimiter || "-";
      const words = input.split(" ");
      const out = words.map((word) => {
        return word.split(sep).map((part) => {
          const n = parseInt(part.trim(), 10);
          if (isNaN(n) || n < 1 || n > 26) return part;
          return String.fromCharCode(n + 64);
        }).join("");
      }).join(" ");
      return { success: true, output: out };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
