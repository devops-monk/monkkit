import type { ToolDefinition } from "@/types/registry";
import { imageResizeTool } from "./image-resize";
import { imageCompressTool } from "./image-compress";
import { imageConvertTool } from "./image-convert";
import { imageCropTool } from "./image-crop";
import { imageRotateTool } from "./image-rotate";
import { imageFiltersTool } from "./image-filters";
import { imageWatermarkTool } from "./image-watermark";
import { imageToBase64Tool } from "./image-to-base64";
import { imageInfoTool } from "./image-info";
import { logoGeneratorTool } from "./logo-generator";

export const imageTools: ToolDefinition[] = [
  imageResizeTool,
  imageCompressTool,
  imageConvertTool,
  imageCropTool,
  imageRotateTool,
  imageFiltersTool,
  imageWatermarkTool,
  imageToBase64Tool,
  imageInfoTool,
  logoGeneratorTool,
];
