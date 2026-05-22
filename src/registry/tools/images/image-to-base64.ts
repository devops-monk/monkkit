import type { ToolDefinition } from "@/types/registry";

export const imageToBase64Tool: ToolDefinition = {
  id: "images-image-to-base64",
  slug: "image-to-base64",
  name: "Image ↔ Base64",
  shortDescription: "Convert images to Base64 data URIs and decode Base64 back to images.",
  description:
    "Two-way converter: encode any image file to a Base64 data URI / raw base64 string, or decode a base64 string back to a viewable and downloadable image. Supports both data URI and raw base64 input.",
  category: "images",
  tags: ["image", "base64", "data-uri", "encode", "decode", "convert"],
  keywords: ["image to base64", "base64 to image", "data uri converter", "image encoder"],
  icon: "Binary",
  status: "new",
  component: () => import("@/tools/images/image-to-base64"),
  process: (input) => import("@/tools/images/image-to-base64/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
