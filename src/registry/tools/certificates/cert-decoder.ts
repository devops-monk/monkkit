import type { ToolDefinition } from "@/types/registry";

export const certDecoderTool: ToolDefinition = {
  id: "certificates-cert-decoder",
  slug: "cert-decoder",
  name: "Certificate Decoder",
  shortDescription: "Decode and inspect X.509 PEM certificates.",
  description: "Paste any PEM certificate to instantly decode subject, issuer, validity dates, SANs, key usage, fingerprints, and more. Highlights expiry status and detects CA certificates.",
  category: "certificates",
  tags: ["certificate", "x509", "pem", "ssl", "tls", "decoder"],
  keywords: ["certificate decoder", "x509 decoder", "pem decoder", "ssl certificate viewer"],
  icon: "ShieldCheck",
  status: "new",
  component: () => import("@/tools/certificates/cert-decoder"),
  process: (input) => import("@/tools/certificates/cert-decoder/logic").then((m) => m.process(input as Parameters<typeof m.process>[0])),
};