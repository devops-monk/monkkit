export interface CropInput {
  imageBase64: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropOutput {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

export function process(input: CropInput): CropOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  if (input.width <= 0 || input.height <= 0) return { success: false, error: "Crop dimensions must be positive" };
  return { success: true, imageBase64: input.imageBase64 };
}
