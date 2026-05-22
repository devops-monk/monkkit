import type { ToolDefinition } from "@/types/registry";

export const imageRotateTool: ToolDefinition = {
  id: "images-image-rotate",
  slug: "image-rotate",
  name: "Image Rotate & Flip",
  shortDescription: "Rotate images by any angle and flip horizontally or vertically.",
  description:
    "Rotate images by preset angles (0°, 90°, 180°, 270°) or a custom degree value. Also supports horizontal and vertical flipping. Canvas transforms are applied client-side.",
  category: "images",
  tags: ["image", "rotate", "flip", "transform", "angle"],
  keywords: ["rotate image", "flip image", "image rotation", "mirror image"],
  icon: "RotateCw",
  status: "new",
  component: () => import("@/tools/images/image-rotate"),
  process: (input) => import("@/tools/images/image-rotate/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
