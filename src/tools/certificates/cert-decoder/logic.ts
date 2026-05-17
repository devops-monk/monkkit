import forge from "node-forge";

export interface CertDecoderInput {
  pem: string;
}

export interface CertField {
  name: string;
  value: string;
}

export interface CertDecoderOutput {
  success: boolean;
  error?: string;
  subject?: CertField[];
  issuer?: CertField[];
  serial?: string;
  notBefore?: string;
  notAfter?: string;
  expired?: boolean;
  daysRemaining?: number;
  signatureAlgorithm?: string;
  publicKeyAlgorithm?: string;
  publicKeySize?: number;
  fingerprints?: { sha1: string; sha256: string };
  sans?: string[];
  keyUsage?: string[];
  extKeyUsage?: string[];
  isCa?: boolean;
  version?: number;
}

function formatDN(attrs: forge.pki.CertificateField[]): CertField[] {
  const map: Record<string, string> = {
    CN: "Common Name", O: "Organization", OU: "Org Unit",
    C: "Country", ST: "State", L: "Locality",
    emailAddress: "Email", serialNumber: "Serial",
  };
  return attrs.map((a) => ({
    name: map[a.shortName ?? ""] ?? a.name ?? a.shortName ?? "",
    value: String(a.value),
  }));
}

function hex(bytes: string): string {
  return Array.from(bytes).map((c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(":").toUpperCase();
}

function fingerprint(derBytes: string, algo: "sha1" | "sha256"): string {
  const md = algo === "sha1" ? forge.md.sha1.create() : forge.md.sha256.create();
  md.update(derBytes);
  return md.digest().toHex().toUpperCase().match(/.{2}/g)!.join(":");
}

export function process(input: CertDecoderInput): CertDecoderOutput {
  try {
    const pem = input.pem.trim();
    if (!pem) return { success: false, error: "Paste a PEM certificate." };

    const cert = forge.pki.certificateFromPem(pem);
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes();

    const now = new Date();
    const notAfter = cert.validity.notAfter;
    const daysRemaining = Math.floor((notAfter.getTime() - now.getTime()) / 86400000);

    // SANs
    const sanExt = cert.getExtension("subjectAltName") as { altNames: { type: number; value: string; ip?: string }[] } | null;
    const sans = sanExt?.altNames.map((n) => (n.type === 7 ? `IP:${n.ip ?? n.value}` : n.value)) ?? [];

    // Key Usage
    const kuExt = cert.getExtension("keyUsage") as Record<string, boolean> | null;
    const KU_LABELS: Record<string, string> = {
      digitalSignature: "Digital Signature", nonRepudiation: "Non Repudiation",
      keyEncipherment: "Key Encipherment", dataEncipherment: "Data Encipherment",
      keyAgreement: "Key Agreement", keyCertSign: "Certificate Sign",
      cRLSign: "CRL Sign", encipherOnly: "Encipher Only", decipherOnly: "Decipher Only",
    };
    const keyUsage = kuExt ? Object.entries(KU_LABELS).filter(([k]) => (kuExt as Record<string, boolean>)[k]).map(([, v]) => v) : [];

    // Extended Key Usage
    const ekuExt = cert.getExtension("extKeyUsage") as Record<string, boolean> | null;
    const EKU_LABELS: Record<string, string> = {
      serverAuth: "TLS Web Server Auth", clientAuth: "TLS Web Client Auth",
      codeSigning: "Code Signing", emailProtection: "Email Protection",
      timeStamping: "Time Stamping", OCSPSigning: "OCSP Signing",
    };
    const extKeyUsage = ekuExt ? Object.entries(EKU_LABELS).filter(([k]) => (ekuExt as Record<string, boolean>)[k]).map(([, v]) => v) : [];

    // Basic Constraints (CA)
    const bcExt = cert.getExtension("basicConstraints") as { cA?: boolean } | null;

    // Public key info
    const pub = cert.publicKey as forge.pki.rsa.PublicKey;
    const keySize = pub.n ? pub.n.bitLength() : undefined;

    return {
      success: true,
      subject: formatDN(cert.subject.attributes),
      issuer: formatDN(cert.issuer.attributes),
      serial: hex(forge.util.hexToBytes(cert.serialNumber)),
      notBefore: cert.validity.notBefore.toISOString(),
      notAfter: cert.validity.notAfter.toISOString(),
      expired: daysRemaining < 0,
      daysRemaining,
      signatureAlgorithm: cert.siginfo.algorithmOid,
      publicKeyAlgorithm: "RSA",
      publicKeySize: keySize,
      fingerprints: { sha1: fingerprint(der, "sha1"), sha256: fingerprint(der, "sha256") },
      sans,
      keyUsage,
      extKeyUsage,
      isCa: bcExt?.cA ?? false,
      version: cert.version + 1,
    };
  } catch (e) {
    return { success: false, error: `Failed to parse certificate: ${(e as Error).message}` };
  }
}