export interface DefangInput {
  input: string;
  mode: "defang" | "refang";
  defangUrls?: boolean;
  defangIps?: boolean;
}

export interface DefangOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): DefangOutput {
  const { input, mode, defangUrls = true, defangIps = true } = params as DefangInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  try {
    let out = input;
    if (mode === "defang") {
      if (defangIps) out = out.replace(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/g, "$1[.]$2[.]$3[.]$4");
      if (defangUrls) {
        out = out.replace(/https?:\/\//gi, (m) => m.replace("://", "[://]").replace("http", "hXXp"));
        out = out.replace(/(?<!\[)\./g, (_, offset) => {
          const ctx = input.slice(Math.max(0, offset - 5), offset + 5);
          if (/\d\.\d/.test(ctx)) return ".";
          return "[.]";
        });
        out = out.replace(/hXXp\[:\/\/\]/, "hXXp[://]");
      }
    } else {
      out = out
        .replace(/\[:\/{2}\]/gi, "://")
        .replace(/hXXps?/gi, (m) => m.replace(/XX/i, "tt"))
        .replace(/\[\.\]/g, ".")
        .replace(/\(\.\)/g, ".");
    }
    return { success: true, output: out };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
