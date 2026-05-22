export interface PassportPhotoInput {
  format: string;
  bgColor: string;
}

export function process(input: unknown): { success: boolean; error?: string } {
  const { format } = input as PassportPhotoInput;
  if (!format) return { success: false, error: "Format is required" };
  return { success: true };
}
