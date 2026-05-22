const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export interface Base32Input {
  input: string;
  mode: "encode" | "decode";
}

export interface Base32Output {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): Base32Output {
  const { input, mode } = params as Base32Input;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input);
      let bits = 0, value = 0;
      let out = "";
      for (const byte of bytes) {
        value = (value << 8) | byte;
        bits += 8;
        while (bits >= 5) {
          out += ALPHABET[(value >>> (bits - 5)) & 31];
          bits -= 5;
        }
      }
      if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
      while (out.length % 8 !== 0) out += "=";
      return { success: true, output: out };
    } else {
      const clean = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
      let bits = 0, value = 0;
      const bytes: number[] = [];
      for (const char of clean) {
        const idx = ALPHABET.indexOf(char);
        if (idx === -1) throw new Error(`Invalid Base32 character: "${char}"`);
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
          bytes.push((value >>> (bits - 8)) & 0xff);
          bits -= 8;
        }
      }
      const decoded = new TextDecoder().decode(new Uint8Array(bytes));
      return { success: true, output: decoded };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
