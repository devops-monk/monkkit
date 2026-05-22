import type { ToolDefinition } from "@/types/registry";

export const imageFiltersTool: ToolDefinition = {
  id: "images-image-filters",
  slug: "image-filters",
  name: "Image Filters",
  shortDescription: "Apply filters and adjustments to images with live preview.",
  description:
    "Apply preset filters (Grayscale, Sepia, Invert, Warm, Cool, High Contrast) or fine-tune brightness, contrast, saturation, and blur individually. Live CSS filter preview, then renders to canvas for download.",
  category: "images",
  tags: ["image", "filters", "brightness", "contrast", "saturation", "blur", "effects"],
  keywords: ["image filters online", "photo effects", "image adjustments", "brightness contrast"],
  icon: "Settings",
  status: "new",
  component: () => import("@/tools/images/image-filters"),
  process: (input) => import("@/tools/images/image-filters/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
