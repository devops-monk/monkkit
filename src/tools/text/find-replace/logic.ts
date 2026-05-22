export interface FindReplaceInput {
  input: string;
  find: string;
  replace: string;
  useRegex?: boolean;
  caseSensitive?: boolean;
  global?: boolean;
}

export interface FindReplaceOutput {
  success: boolean;
  output?: string;
  count?: number;
  error?: string;
}

export function process(params: unknown): FindReplaceOutput {
  const { input, find, replace, useRegex = false, caseSensitive = true, global: globalFlag = true } = params as FindReplaceInput;
  if (!input) return { success: false, error: "Input is empty" };
  if (!find) return { success: false, error: "Find pattern is empty" };
  try {
    let flags = globalFlag ? "g" : "";
    if (!caseSensitive) flags += "i";
    const pattern = useRegex ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(pattern, flags);
    let count = 0;
    const output = input.replace(re, (m) => { count++; return replace; });
    return { success: true, output, count };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
