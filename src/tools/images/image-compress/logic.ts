export interface CompressInput {
  imageBase64: string;
  quality: number;
  format: "jpeg" | "webp" | "png";
}

export interface CompressOutput {
  success: boolean;
  imageBase64?: string;
  originalSize?: number;
  compressedSize?: number;
  savings?: number;
  error?: string;
}

export function process(input: CompressInput): CompressOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  if (input.quality < 1 || input.quality > 100) return { success: false, error: "Quality must be between 1 and 100" };
  return { success: true, imageBase64: input.imageBase64 };
}
