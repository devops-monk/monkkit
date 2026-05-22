import type { ToolDefinition } from "@/types/registry";

export const imageInfoTool: ToolDefinition = {
  id: "images-image-info",
  slug: "image-info",
  name: "Image Info",
  shortDescription: "Inspect image metadata: dimensions, size, type, aspect ratio, and more.",
  description:
    "Instantly view detailed metadata for any image: filename, file size, MIME type, pixel dimensions, aspect ratio, megapixels, and last modified date. No processing required — reads metadata directly from the file.",
  category: "images",
  tags: ["image", "info", "metadata", "dimensions", "aspect-ratio", "inspect"],
  keywords: ["image info", "image metadata viewer", "image dimensions", "image inspector"],
  icon: "FileSearch",
  status: "new",
  component: () => import("@/tools/images/image-info"),
  process: (input) => import("@/tools/images/image-info/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
