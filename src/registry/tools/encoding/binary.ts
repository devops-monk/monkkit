import type { ToolDefinition } from "@/types/registry";

export const binaryTool: ToolDefinition = {
  id: "encoding-binary",
  slug: "binary",
  name: "Binary Encode / Decode",
  shortDescription: "Convert text to binary bits or decode binary back to text.",
  description: "Encode text as 8-bit binary groups or decode binary strings back to readable text. Supports space, none, and comma delimiters.",
  category: "encoding",
  tags: ["binary", "bits", "encode", "decode", "0b"],
  keywords: ["binary encoder decoder", "text to binary", "binary to text"],
  icon: "ToggleLeft",
  status: "new",
  component: () => import("@/tools/encoding/binary"),
  process: (input) => import("@/tools/encoding/binary/logic").then((m) => m.process(input)),
};
