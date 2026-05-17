import type { ToolDefinition } from "@/types/registry";
import { certDecoderTool } from "./cert-decoder";
import { csrDecoderTool } from "./csr-decoder";
import { certFingerprintTool } from "./cert-fingerprint";
import { pemConverterTool } from "./pem-converter";
import { selfSignedGeneratorTool } from "./self-signed-generator";
import { csrGeneratorTool } from "./csr-generator";

export const certificateTools: ToolDefinition[] = [
  certDecoderTool,
  csrDecoderTool,
  certFingerprintTool,
  pemConverterTool,
  selfSignedGeneratorTool,
  csrGeneratorTool,
];