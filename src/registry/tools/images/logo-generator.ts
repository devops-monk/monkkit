import type { ToolDefinition } from "@/types/registry";

export const logoGeneratorTool: ToolDefinition = {
  id: "logo-generator",
  slug: "logo-generator",
  name: "Logo Generator",
  shortDescription: "Create custom logos with text, shapes, and gradients",
  description:
    "Design professional logos directly in your browser. Customize text, fonts, colors, gradients, shapes, and more — then export as PNG at any size.",
  category: "images",
  tags: ["logo", "design", "generator", "canvas", "branding", "icon"],
  keywords: ["logo", "make logo", "create logo", "brand", "icon generator", "text logo"],
  icon: "Layers",
  status: "stable",
  component: () =>
    import("@/tools/images/logo-generator").then((m) => ({
      default: m.default,
    })),
  process: () =>
    import("@/tools/images/logo-generator/logic").then((m) => m.process),
};
