import type { ToolDefinition } from "@/types/registry";

export const certFingerprintTool: ToolDefinition = {
  id: "certificates-cert-fingerprint",
  slug: "cert-fingerprint",
  name: "Certificate Fingerprint",
  shortDescription: "Compute SHA-1, SHA-256, and SHA-512 fingerprints of a certificate.",
  description: "Paste a PEM certificate to compute its SHA-1, SHA-256, and SHA-512 fingerprints. Useful for pinning, verification, and audit logs. Computed locally using the Web Crypto API.",
  category: "certificates",
  tags: ["certificate", "fingerprint", "sha256", "sha1", "hash", "ssl"],
  keywords: ["certificate fingerprint", "ssl fingerprint", "sha256 certificate", "cert thumbprint"],
  icon: "Fingerprint",
  status: "new",
  component: () => import("@/tools/certificates/cert-fingerprint"),
  process: (input) => import("@/tools/certificates/cert-fingerprint/logic").then((m) => m.process(input as Parameters<typeof m.process>[0])),
};