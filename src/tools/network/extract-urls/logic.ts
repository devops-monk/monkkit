export interface ExtractUrlsInput {
  input: string;
  unique?: boolean;
}

export interface ExtractUrlsOutput {
  success: boolean;
  urls?: string[];
  count?: number;
  error?: string;
}

const URL_RE = /https?:\/\/(?:[-\w@:%.+~#=]{1,256})(?:\.[a-zA-Z]{2,})+(?:[-\w@:%+.~#?&/=]*)/g;

export function process(params: unknown): ExtractUrlsOutput {
  const { input, unique = true } = params as ExtractUrlsInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  let urls: string[] = input.match(URL_RE) ?? [];
  if (unique) urls = [...new Set(urls)];
  return { success: true, urls, count: urls.length };
}
