import forge from "node-forge";

export interface CsrDecoderInput { pem: string }

export interface CsrDecoderOutput {
  success: boolean;
  error?: string;
  subject?: { name: string; value: string }[];
  publicKeyAlgorithm?: string;
  publicKeySize?: number;
  signatureAlgorithm?: string;
  sans?: string[];
  verified?: boolean;
}

const DN_MAP: Record<string, string> = {
  CN: "Common Name", O: "Organization", OU: "Org Unit",
  C: "Country", ST: "State", L: "Locality", emailAddress: "Email",
};

const OID_MAP: Record<string, string> = {
  "1.2.840.113549.1.1.11": "SHA-256 with RSA",
  "1.2.840.113549.1.1.5": "SHA-1 with RSA",
  "1.2.840.113549.1.1.13": "SHA-512 with RSA",
};

export function process(input: CsrDecoderInput): CsrDecoderOutput {
  try {
    const pem = input.pem.trim();
    if (!pem) return { success: false, error: "Paste a PEM CSR." };

    const csr = forge.pki.certificationRequestFromPem(pem);
    const verified = csr.verify();

    const subject = csr.subject.attributes.map((a) => ({
      name: DN_MAP[a.shortName ?? ""] ?? a.name ?? a.shortName ?? "",
      value: String(a.value),
    }));

    const pub = csr.publicKey as forge.pki.rsa.PublicKey;
    const keySize = pub.n ? pub.n.bitLength() : undefined;

    // SANs from extensions
    const sans: string[] = [];
    const exts = (csr as unknown as { getAttribute: (n: object) => { extensions?: { name: string; altNames?: { type: number; value: string; ip?: string }[] }[] } | null }).getAttribute({ name: "extensionRequest" });
    if (exts?.extensions) {
      const sanExt = exts.extensions.find((e) => e.name === "subjectAltName");
      if (sanExt?.altNames) {
        sans.push(...sanExt.altNames.map((n) => (n.type === 7 ? `IP:${n.ip ?? n.value}` : n.value)));
      }
    }

    return {
      success: true,
      subject,
      publicKeyAlgorithm: "RSA",
      publicKeySize: keySize,
      signatureAlgorithm: OID_MAP[csr.siginfo?.algorithmOid ?? ""] ?? csr.siginfo?.algorithmOid ?? "Unknown",
      sans,
      verified,
    };
  } catch (e) {
    return { success: false, error: `Failed to parse CSR: ${(e as Error).message}` };
  }
}