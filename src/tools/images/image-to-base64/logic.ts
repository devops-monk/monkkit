export interface Base64Input {
  imageBase64?: string;
  rawBase64?: string;
  mode: "image-to-base64" | "base64-to-image";
}

export interface Base64Output {
  success: boolean;
  dataUri?: string;
  rawBase64?: string;
  imageBase64?: string;
  error?: string;
}

export function process(input: Base64Input): Base64Output {
  if (input.mode === "image-to-base64") {
    if (!input.imageBase64) return { success: false, error: "No image provided" };
    return { success: true, dataUri: input.imageBase64, rawBase64: input.imageBase64.split(",")[1] ?? input.imageBase64 };
  } else {
    if (!input.rawBase64) return { success: false, error: "No base64 data provided" };
    return { success: true, imageBase64: `data:image/png;base64,${input.rawBase64}` };
  }
}
