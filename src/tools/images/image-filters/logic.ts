export interface FiltersInput {
  imageBase64: string;
  preset: string;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

export interface FiltersOutput {
  success: boolean;
  imageBase64?: string;
  error?: string;
}

export function process(input: FiltersInput): FiltersOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  return { success: true, imageBase64: input.imageBase64 };
}
