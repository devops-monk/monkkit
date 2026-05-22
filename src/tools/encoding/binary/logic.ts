export interface BinaryInput {
  input: string;
  mode: "encode" | "decode";
  delimiter?: "space" | "none" | "comma";
}

export interface BinaryOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): BinaryOutput {
  const { input, mode, delimiter = "space" } = params as BinaryInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    if (mode === "encode") {
      const bytes = new TextEncoder().encode(input);
      const bits = Array.from(bytes).map((b) => b.toString(2).padStart(8, "0"));
      let out: string;
      if (delimiter === "none") out = bits.join("");
      else if (delimiter === "comma") out = bits.join(", ");
      else out = bits.join(" ");
      return { success: true, output: out };
    } else {
      const cleaned = input.replace(/[,\s]+/g, " ").trim();
      let groups: string[];
      if (cleaned.includes(" ")) {
        groups = cleaned.split(" ").filter(Boolean);
      } else {
        if (cleaned.length % 8 !== 0) throw new Error("Binary string length must be a multiple of 8");
        groups = cleaned.match(/.{8}/g) ?? [];
      }
      const bytes = groups.map((b) => {
        if (!/^[01]+$/.test(b)) throw new Error(`Invalid binary group: "${b}"`);
        return parseInt(b, 2);
      });
      const decoded = new TextDecoder().decode(new Uint8Array(bytes));
      return { success: true, output: decoded };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
