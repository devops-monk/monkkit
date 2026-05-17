import type { ToolDefinition } from "@/types/registry";
import { qrCodeTool } from "./qr-code";
import { barcodeTool } from "./barcode";
import { passwordTool } from "./password";

export const generatorTools: ToolDefinition[] = [qrCodeTool, barcodeTool, passwordTool];
