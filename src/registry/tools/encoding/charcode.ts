import type { ToolDefinition } from "@/types/registry";

export const charcodeTool: ToolDefinition = {
  id: "encoding-charcode",
  slug: "charcode",
  name: "Charcode Encode / Decode",
  shortDescription: "Convert text to Unicode char codes or decode char codes back to text.",
  description: "Convert each character to its Unicode code point (decimal, hex, or octal) or reverse the process. Useful for inspecting non-printable or special characters.",
  category: "encoding",
  tags: ["charcode", "unicode", "codepoint", "encode", "decode"],
  keywords: ["charcode converter", "unicode code points", "text to charcode"],
  icon: "Code",
  status: "new",
  component: () => import("@/tools/encoding/charcode"),
  process: (input) => import("@/tools/encoding/charcode/logic").then((m) => m.process(input)),
};
