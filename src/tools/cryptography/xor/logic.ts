export interface XorInput {
  input: string;
  key: string;
  keyType?: "utf8" | "hex" | "decimal";
  outputType?: "hex" | "utf8";
}

export interface XorOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): XorOutput {
  const { input, key, keyType = "utf8", outputType = "hex" } = params as XorInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  if (!key?.trim()) return { success: false, error: "Key is required" };
  try {
    const inputBytes = new TextEncoder().encode(input);
    let keyBytes: Uint8Array;
    if (keyType === "hex") {
      const hexParts = key.replace(/\s/g, "").match(/.{1,2}/g) ?? [];
      keyBytes = new Uint8Array(hexParts.map((h) => parseInt(h, 16)));
    } else if (keyType === "decimal") {
      keyBytes = new Uint8Array(key.split(/[\s,]+/).filter(Boolean).map(Number));
    } else {
      keyBytes = new TextEncoder().encode(key);
    }
    if (!keyBytes.length) throw new Error("Key is empty after parsing");
    const result = inputBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
    if (outputType === "utf8") {
      return { success: true, output: new TextDecoder().decode(result) };
    }
    return { success: true, output: Array.from(result).map((b) => b.toString(16).padStart(2, "0")).join(" ") };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
