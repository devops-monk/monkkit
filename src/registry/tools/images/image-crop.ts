import type { ToolDefinition } from "@/types/registry";

export const imageCropTool: ToolDefinition = {
  id: "images-image-crop",
  slug: "image-crop",
  name: "Image Crop",
  shortDescription: "Crop images by specifying exact pixel coordinates and dimensions.",
  description:
    "Crop any region from an image by entering X/Y offset and width/height in pixels. Uses the Canvas drawImage source rect API for precise cropping. All processing happens in your browser.",
  category: "images",
  tags: ["image", "crop", "trim", "cut", "canvas"],
  keywords: ["image cropper", "crop image online", "trim image", "cut image"],
  icon: "Image",
  status: "new",
  component: () => import("@/tools/images/image-crop"),
  process: (input) => import("@/tools/images/image-crop/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
