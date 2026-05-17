import type { ToolDefinition } from "@/types/registry";

export const pemConverterTool: ToolDefinition = {
  id: "certificates-pem-converter",
  slug: "pem-converter",
  name: "PEM Converter",
  shortDescription: "Convert between PEM, DER, and Base64 certificate formats.",
  description: "Convert certificates, keys, and CSRs between PEM, DER (hex), and raw Base64. Strips or adds PEM headers as needed.",
  category: "certificates",
  tags: ["pem", "der", "base64", "certificate", "converter", "format"],
  keywords: ["pem to der", "der to pem", "certificate converter", "pem base64 converter"],
  icon: "ArrowLeftRight",
  status: "new",
  component: () => import("@/tools/certificates/pem-converter"),
  process: (input) => import("@/tools/certificates/pem-converter/logic").then((m) => m.process(input as Parameters<typeof m.process>[0])),
};