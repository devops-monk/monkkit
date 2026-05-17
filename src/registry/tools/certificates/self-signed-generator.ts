import type { ToolDefinition } from "@/types/registry";

export const selfSignedGeneratorTool: ToolDefinition = {
  id: "certificates-self-signed-generator",
  slug: "self-signed-generator",
  name: "Self-Signed Certificate Generator",
  shortDescription: "Generate a self-signed X.509 certificate and key pair in your browser.",
  description: "Create self-signed certificates for development, testing, or internal use. Supports custom SANs, key size, validity period, and all DN fields. Keys are generated locally — nothing is sent to a server.",
  category: "certificates",
  tags: ["certificate", "self-signed", "generator", "x509", "ssl", "tls", "key"],
  keywords: ["self signed certificate generator", "create ssl certificate", "x509 generator online"],
  icon: "ShieldPlus",
  status: "new",
  component: () => import("@/tools/certificates/self-signed-generator"),
  process: (input) => import("@/tools/certificates/self-signed-generator/logic").then((m) => m.process(input as Parameters<typeof m.process>[0])),
};