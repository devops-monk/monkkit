import type { ToolDefinition } from "@/types/registry";

export const imageResizeTool: ToolDefinition = {
  id: "images-image-resize",
  slug: "image-resize",
  name: "Image Resize",
  shortDescription: "Resize images to exact dimensions or by percentage in your browser.",
  description:
    "Resize any image to custom pixel dimensions or by percentage. Toggle aspect ratio lock to maintain proportions. All processing is done client-side using the Canvas API — no uploads needed.",
  category: "images",
  tags: ["image", "resize", "dimensions", "scale", "canvas"],
  keywords: ["image resizer", "resize image online", "change image size", "scale image"],
  icon: "Layers",
  status: "new",
  component: () => import("@/tools/images/image-resize"),
  process: (input) => import("@/tools/images/image-resize/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
