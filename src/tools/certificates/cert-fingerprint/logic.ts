export interface FingerprintInput { pem: string }

export interface FingerprintOutput {
  success: boolean;
  error?: string;
  sha1?: string;
  sha256?: string;
  sha512?: string;
  md5?: string;
}

function pemToDer(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function toHexColon(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(":");
}

export async function process(input: FingerprintInput): Promise<FingerprintOutput> {
  try {
    const pem = input.pem.trim();
    if (!pem) return { success: false, error: "Paste a PEM certificate." };

    const der = pemToDer(pem);

    const [sha1, sha256, sha512] = await Promise.all([
      crypto.subtle.digest("SHA-1", der),
      crypto.subtle.digest("SHA-256", der),
      crypto.subtle.digest("SHA-512", der),
    ]);

    return {
      success: true,
      sha1: toHexColon(sha1),
      sha256: toHexColon(sha256),
      sha512: toHexColon(sha512),
    };
  } catch (e) {
    return { success: false, error: `Failed to compute fingerprint: ${(e as Error).message}` };
  }
}