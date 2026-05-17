export type ConvertMode = "pem-to-der" | "der-to-pem" | "pem-to-base64" | "base64-to-pem";
export type PemType = "CERTIFICATE" | "CERTIFICATE REQUEST" | "PRIVATE KEY" | "RSA PRIVATE KEY" | "PUBLIC KEY";

export interface PemConverterInput {
  input: string;
  mode: ConvertMode;
  pemType: PemType;
}

export interface PemConverterOutput {
  success: boolean;
  error?: string;
  output?: string;
  bytes?: number;
}

function stripPem(pem: string): string {
  return pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
}

function wrapPem(b64: string, type: PemType): string {
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${type}-----\n${lines}\n-----END ${type}-----`;
}

export function process(input: PemConverterInput): PemConverterOutput {
  try {
    const raw = input.input.trim();
    if (!raw) return { success: false, error: "Paste input to convert." };

    switch (input.mode) {
      case "pem-to-der": {
        const b64 = stripPem(raw);
        const bin = atob(b64);
        const hex = Array.from(bin).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
        return { success: true, output: hex, bytes: bin.length };
      }
      case "der-to-pem": {
        // Input is hex bytes separated by spaces or newlines
        const cleaned = raw.replace(/\s+/g, "");
        const bin = cleaned.match(/.{2}/g)?.map((h) => String.fromCharCode(parseInt(h, 16))).join("") ?? "";
        const b64 = btoa(bin);
        return { success: true, output: wrapPem(b64, input.pemType), bytes: bin.length };
      }
      case "pem-to-base64": {
        const b64 = stripPem(raw);
        return { success: true, output: b64, bytes: atob(b64).length };
      }
      case "base64-to-pem": {
        const b64 = raw.replace(/\s+/g, "");
        atob(b64); // validate
        return { success: true, output: wrapPem(b64, input.pemType), bytes: atob(b64).length };
      }
      default:
        return { success: false, error: "Unknown conversion mode." };
    }
  } catch (e) {
    return { success: false, error: `Conversion failed: ${(e as Error).message}` };
  }
}