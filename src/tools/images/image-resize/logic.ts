export interface ResizeInput {
  imageBase64: string;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  format?: string;
}

export interface ResizeOutput {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

export function process(input: ResizeInput): ResizeOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  if (input.width <= 0 || input.height <= 0) return { success: false, error: "Width and height must be positive" };
  return { success: true, imageBase64: input.imageBase64 };
}
