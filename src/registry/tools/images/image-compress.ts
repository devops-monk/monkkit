import type { ToolDefinition } from "@/types/registry";

export const imageCompressTool: ToolDefinition = {
  id: "images-image-compress",
  slug: "image-compress",
  name: "Image Compress",
  shortDescription: "Compress images with adjustable quality and format selection.",
  description:
    "Reduce image file size by adjusting quality (1–100) and choosing output format (JPEG, WebP, or PNG). Shows original size, compressed size, and savings percentage. Processing is fully client-side.",
  category: "images",
  tags: ["image", "compress", "optimize", "quality", "webp", "jpeg"],
  keywords: ["image compressor", "compress image online", "reduce image size", "image optimizer"],
  icon: "Filter",
  status: "new",
  component: () => import("@/tools/images/image-compress"),
  process: (input) => import("@/tools/images/image-compress/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
