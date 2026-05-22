export interface HexInput {
  input: string;
  mode: "encode" | "decode";
  delimiter?: "space" | "none" | "0x" | "comma";
}

export interface HexOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): HexOutput {
  const { input, mode, delimiter = "space" } = params as HexInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input);
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0"));
      let out: string;
      if (delimiter === "none") out = hex.join("");
      else if (delimiter === "0x") out = hex.map((h) => `0x${h}`).join(" ");
      else if (delimiter === "comma") out = hex.join(", ");
      else out = hex.join(" ");
      return { success: true, output: out };
    } else {
      const cleaned = input
        .replace(/0x/gi, "")
        .replace(/[,\s]+/g, " ")
        .trim();
      const pairs = cleaned.match(/.{1,2}/g) ?? cleaned.split(" ").filter(Boolean);
      const bytes = pairs.map((h) => {
        const n = parseInt(h.trim(), 16);
        if (isNaN(n)) throw new Error(`Invalid hex byte: "${h}"`);
        return n;
      });
      const decoded = new TextDecoder().decode(new Uint8Array(bytes));
      return { success: true, output: decoded };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
