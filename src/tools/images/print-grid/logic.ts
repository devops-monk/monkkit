export interface PrintGridInput {
  paper: string;
  photoWidth: number;
  photoHeight: number;
}

export function process(input: unknown): { success: boolean; error?: string } {
  const { paper } = input as PrintGridInput;
  if (!paper) return { success: false, error: "Paper size is required" };
  return { success: true };
}
