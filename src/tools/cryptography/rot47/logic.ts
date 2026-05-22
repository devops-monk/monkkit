export interface Rot47Input {
  input: string;
}

export interface Rot47Output {
  success: boolean;
  output?: string;
  error?: string;
}

export function process(params: unknown): Rot47Output {
  const { input } = params as Rot47Input;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  const out = input.replace(/[!-~]/g, (ch) => {
    return String.fromCharCode(((ch.charCodeAt(0) - 33 + 47) % 94) + 33);
  });
  return { success: true, output: out };
}
