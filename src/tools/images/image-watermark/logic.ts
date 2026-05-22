export interface WatermarkInput {
  imageBase64: string;
  text: string;
  fontSize: number;
  opacity: number;
  position: string;
  color: string;
  font: string;
}

export interface WatermarkOutput {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

export function process(input: WatermarkInput): WatermarkOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  if (!input.text) return { success: false, error: "Watermark text is required" };
  return { success: true, imageBase64: input.imageBase64 };
}
