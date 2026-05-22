export interface AtbashInput {
  input: string;
}

export interface AtbashOutput {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): AtbashOutput {
  const { input } = params as AtbashInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  const out = input.replace(/[a-zA-Z]/g, (ch) => {
    const base = ch >= "a" ? 97 : 65;
    return String.fromCharCode(base + (25 - (ch.charCodeAt(0) - base)));
  });
  return { success: true, output: out };
}
