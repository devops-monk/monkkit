export interface ConvertInput {
  imageBase64: string;
  targetFormat: "jpeg" | "png" | "webp";
}

export interface ConvertOutput {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

export function process(input: ConvertInput): ConvertOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  return { success: true, imageBase64: input.imageBase64 };
}
