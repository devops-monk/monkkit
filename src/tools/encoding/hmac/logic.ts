export type HmacAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export interface HmacInput {
  input: string;
  key: string;
  algorithm?: HmacAlgo;
  uppercase?: boolean;
}

export interface HmacOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export async function process(params: unknown): Promise<HmacOutput> {
  const { input, key, algorithm = "SHA-256", uppercase = false } = params as HmacInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  if (!key) return { success: false, error: "Key is required" };
  try {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(key),
      { name: "HMAC", hash: algorithm },
      false,
      ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(input));
    const hex = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return { success: true, output: uppercase ? hex.toUpperCase() : hex };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
