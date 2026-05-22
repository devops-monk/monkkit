export interface ImageInfoInput {
  imageBase64: string;
  filename?: string;
  fileSize?: number;
  fileType?: string;
  lastModified?: number;
}

export interface ImageInfoOutput {
  success: boolean;
  info?: {
    filename: string;
    fileSize: string;
    type: string;
    width: number;
    height: number;
    aspectRatio: string;
    megapixels: string;
    lastModified: string;
  };
  error?: string;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function process(input: ImageInfoInput): ImageInfoOutput {
  if (!input.imageBase64) return { success: false, error: "No image provided" };
  return { success: true };
}
