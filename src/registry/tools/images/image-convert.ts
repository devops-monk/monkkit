import type { ToolDefinition } from "@/types/registry";

export const imageConvertTool: ToolDefinition = {
  id: "images-image-convert",
  slug: "image-convert",
  name: "Image Convert",
  shortDescription: "Convert images between JPEG, PNG, and WebP formats instantly.",
  description:
    "Convert any image to JPEG, PNG, or WebP format using the Canvas API. JPEG conversion automatically applies a white background. All processing is done locally in your browser.",
  category: "images",
  tags: ["image", "convert", "format", "jpeg", "png", "webp"],
  keywords: ["image converter", "convert image format", "jpg to png", "png to webp"],
  icon: "RefreshCw",
  status: "new",
  component: () => import("@/tools/images/image-convert"),
  process: (input) => import("@/tools/images/image-convert/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
