export interface VigenereInput {
  input: string;
  key: string;
  mode: "encode" | "decode";
}

export interface VigenereOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): VigenereOutput {
  const { input, key, mode } = params as VigenereInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  if (!key?.trim()) return { success: false, error: "Key is required" };
  const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanKey) return { success: false, error: "Key must contain at least one letter" };
  try {
    let keyIdx = 0;
    const out = input.replace(/[a-zA-Z]/g, (ch) => {
      const base = ch >= "a" ? 97 : 65;
      const shift = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 97;
      keyIdx++;
      const s = mode === "decode" ? (26 - shift) % 26 : shift;
      return String.fromCharCode(((ch.charCodeAt(0) - base + s) % 26) + base);
    });
    return { success: true, output: out };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
