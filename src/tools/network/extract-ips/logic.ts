export interface ExtractIpsInput {
  input: string;
  includeIPv6?: boolean;
  unique?: boolean;
}

export interface ExtractIpsOutput {
  success: boolean;
  ips?: string[];
  count?: number;
  error?: string;
}

const IPV4_RE = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g;
const IPV6_RE = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\b/g;

export function process(params: unknown): ExtractIpsOutput {
  const { input, includeIPv6 = true, unique = true } = params as ExtractIpsInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  let ips: string[] = [...(input.match(IPV4_RE) ?? [])];
  if (includeIPv6) ips = [...ips, ...(input.match(IPV6_RE) ?? [])];
  if (unique) ips = [...new Set(ips)];
  return { success: true, ips, count: ips.length };
}
