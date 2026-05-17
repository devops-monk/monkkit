import type { ToolDefinition } from "@/types/registry";

export const csrGeneratorTool: ToolDefinition = {
  id: "certificates-csr-generator",
  slug: "csr-generator",
  name: "CSR Generator",
  shortDescription: "Generate a Certificate Signing Request and private key.",
  description: "Generate a PKCS#10 CSR and RSA private key pair entirely in your browser. Fill in your organization details, add SANs, choose key size, and download both the CSR and private key. Submit the CSR to a CA (Let's Encrypt, DigiCert, etc.) to get a signed certificate.",
  category: "certificates",
  tags: ["csr", "certificate", "signing", "request", "generator", "ssl", "key"],
  keywords: ["csr generator", "certificate signing request generator", "ssl csr generator online"],
  icon: "FilePen",
  status: "new",
  component: () => import("@/tools/certificates/csr-generator"),
  process: (input) => import("@/tools/certificates/csr-generator/logic").then((m) => m.process(input as Parameters<typeof m.process>[0])),
};