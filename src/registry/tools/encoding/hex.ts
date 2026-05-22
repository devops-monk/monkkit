import type { ToolDefinition } from "@/types/registry";

export const hexTool: ToolDefinition = {
  id: "encoding-hex",
  slug: "hex",
  name: "Hex Encode / Decode",
  shortDescription: "Convert text to hexadecimal or decode hex back to text.",
  description: "Encode text as hexadecimal bytes or decode hex strings back to readable text. Supports multiple delimiters: space, none, 0x prefix, or comma-separated.",
  category: "encoding",
  tags: ["hex", "hexadecimal", "encode", "decode", "bytes"],
  keywords: ["hex encoder decoder", "hexadecimal to text", "text to hex"],
  icon: "Hash",
  status: "new",
  component: () => import("@/tools/encoding/hex"),
  process: (input) => import("@/tools/encoding/hex/logic").then((m) => m.process(input)),
};
