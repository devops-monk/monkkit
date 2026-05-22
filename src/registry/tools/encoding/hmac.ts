import type { ToolDefinition } from "@/types/registry";

export const hmacTool: ToolDefinition = {
  id: "encoding-hmac",
  slug: "hmac",
  name: "HMAC Generator",
  shortDescription: "Generate HMAC signatures using SHA-1, SHA-256, SHA-384, or SHA-512.",
  description: "Generate Hash-based Message Authentication Codes (HMAC) using a secret key and your choice of SHA hash algorithm. Runs entirely in your browser.",
  category: "encoding",
  tags: ["hmac", "sha256", "sha512", "mac", "authentication", "signature"],
  keywords: ["hmac generator online", "hmac sha256", "message authentication code"],
  icon: "ShieldCheck",
  status: "new",
  component: () => import("@/tools/encoding/hmac"),
  process: (input) => import("@/tools/encoding/hmac/logic").then((m) => m.process(input)),
};
