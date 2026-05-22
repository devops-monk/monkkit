import type { ToolDefinition } from "@/types/registry";
import { base64Tool } from "./base64";
import { urlEncodeTool } from "./url-encode";
import { htmlEntitiesTool } from "./html-entities";
import { hashTool } from "./hash";
import { hexTool } from "./hex";
import { binaryTool } from "./binary";
import { base32Tool } from "./base32";
import { charcodeTool } from "./charcode";
import { hmacTool } from "./hmac";

export const encodingTools: ToolDefinition[] = [
  base64Tool,
  base32Tool,
  hexTool,
  binaryTool,
  charcodeTool,
  urlEncodeTool,
  htmlEntitiesTool,
  hashTool,
  hmacTool,
];
