import type { ToolDefinition } from "@/types/registry";

export const base32Tool: ToolDefinition = {
  id: "encoding-base32",
  slug: "base32",
  name: "Base32 Encode / Decode",
  shortDescription: "Encode text to Base32 or decode Base32 back to text.",
  description: "Encode plain text or binary data to Base32 (RFC 4648), or decode Base32 strings back to readable text. Uses the standard A–Z, 2–7 alphabet.",
  category: "encoding",
  tags: ["base32", "encode", "decode", "rfc4648"],
  keywords: ["base32 encoder decoder", "base32 encode online"],
  icon: "Binary",
  status: "new",
  component: () => import("@/tools/encoding/base32"),
  process: (input) => import("@/tools/encoding/base32/logic").then((m) => m.process(input)),
};
