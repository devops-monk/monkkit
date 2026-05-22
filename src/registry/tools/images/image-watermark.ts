import type { ToolDefinition } from "@/types/registry";

export const imageWatermarkTool: ToolDefinition = {
  id: "images-image-watermark",
  slug: "image-watermark",
  name: "Image Watermark",
  shortDescription: "Add text watermarks to images with custom font, position, and opacity.",
  description:
    "Overlay text watermarks on images. Customize font family, size, color, opacity (1–100%), and position (9 placements). Uses canvas fillText for rendering. All processing is client-side.",
  category: "images",
  tags: ["image", "watermark", "text overlay", "branding", "copyright"],
  keywords: ["add watermark to image", "image watermark online", "text overlay image", "copyright image"],
  icon: "FilePen",
  status: "new",
  component: () => import("@/tools/images/image-watermark"),
  process: (input) => import("@/tools/images/image-watermark/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};
