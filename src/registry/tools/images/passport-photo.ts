import type { ToolDefinition } from "@/types/registry";

export const passportPhotoTool: ToolDefinition = {
  id: "images-passport-photo",
  slug: "passport-photo",
  name: "Passport Photo Maker",
  shortDescription: "Crop and export photos to official passport dimensions for any country.",
  description:
    "Upload a photo, select your country's passport format, drag the crop box to frame your face, choose a background color, then download a print-ready PNG or a 4×6 sheet with multiple copies. Supports US, UK, EU, India, Australia, China, UAE, and Japan. All processing is done in your browser — no uploads.",
  category: "images",
  tags: ["passport", "photo", "crop", "id photo", "visa", "print"],
  keywords: ["passport photo maker", "id photo", "visa photo", "crop passport photo", "print passport photo"],
  icon: "Image",
  status: "new",
  component: () =>
    import("@/tools/images/passport-photo").then((m) => ({ default: m.default })),
  process: (input) =>
    import("@/tools/images/passport-photo/logic").then((m) =>
      Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))
    ),
};
