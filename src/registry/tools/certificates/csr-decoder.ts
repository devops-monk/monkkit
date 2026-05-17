import type { ToolDefinition } from "@/types/registry";

export const csrDecoderTool: ToolDefinition = {
  id: "certificates-csr-decoder",
  slug: "csr-decoder",
  name: "CSR Decoder",
  shortDescription: "Decode and verify a Certificate Signing Request.",
  description: "Paste a PEM CSR to decode its subject fields, public key info, SANs, and verify the signature is self-consistent.",
  category: "certificates",
  tags: ["csr", "certificate", "signing", "request", "pkcs10", "decoder"],
  keywords: ["csr decoder", "certificate signing request decoder", "pkcs10 decoder"],
  icon: "FileKey",
  status: "new",
  component: () => import("@/tools/certificates/csr-decoder"),
  process: (input) => import("@/tools/certificates/csr-decoder/logic").then((m) => m.process(input as Parameters<typeof m.process>[0])),
};