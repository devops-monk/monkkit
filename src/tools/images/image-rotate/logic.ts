export interface RotateInput {
  imageBase64: string;
  angle: number;
  flipH: boolean;
  flipV: boolean;
}

export interface RotateOutput {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

export function process(input: RotateInput): RotateOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  return { success: true, imageBase64: input.imageBase64 };
}
