import type { ToolDefinition } from "@/types/registry";

export const printGridTool: ToolDefinition = {
  id: "images-print-grid",
  slug: "print-grid",
  name: "Photo Print Grid",
  shortDescription: "Tile one image into a print-ready grid sheet at any size.",
  description:
    "Upload a single image and automatically tile it across a print sheet (4×6, 5×7, 8×10, Letter, A4, A5). Resize each photo with a slider, set gap and margin, then download a 300 DPI PNG ready for a photo lab or home printer.",
  category: "images",
  tags: ["print", "grid", "photo", "tile", "layout", "sheet"],
  keywords: ["photo grid", "print multiple photos", "tile image", "photo sheet", "print layout"],
  icon: "LayoutGrid",
  status: "new",
  component: () =>
    import("@/tools/images/print-grid").then((m) => ({ default: m.default })),
  process: (input) =>
    import("@/tools/images/print-grid/logic").then((m) =>
      Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))
    ),
};
