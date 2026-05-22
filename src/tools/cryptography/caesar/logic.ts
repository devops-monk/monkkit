export interface CaesarInput {
  input: string;
  shift: number;
  mode: "encode" | "decode";
}

export interface CaesarOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): CaesarOutput {
  const { input, shift = 13, mode } = params as CaesarInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    const s = mode === "decode" ? ((26 - (shift % 26)) % 26) : (shift % 26 + 26) % 26;
    const out = input.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch >= "a" ? 97 : 65;
      return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
    });
    return { success: true, output: out };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
