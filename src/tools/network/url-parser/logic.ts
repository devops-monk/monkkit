export interface UrlParserInput {
  input: string;
}

export interface ParsedUrl {
  protocol: string;
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  href: string;
  queryParams: Record<string, string[]>;
}

export interface UrlParserOutput {
  success: boolean;
  parsed?: ParsedUrl;
  error?: string;
}

export function process(params: unknown): UrlParserOutput {
  const { input } = params as UrlParserInput;
  const trimmed = input?.trim();
  if (!trimmed) return { success: false, error: "Input is empty" };
  try {
    const url = new URL(trimmed);
    const queryParams: Record<string, string[]> = {};
    url.searchParams.forEach((value, key) => {
      if (!queryParams[key]) queryParams[key] = [];
      queryParams[key].push(value);
    });
    return {
      success: true,
      parsed: {
        protocol: url.protocol,
        username: url.username,
        password: url.password,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        origin: url.origin,
        href: url.href,
        queryParams,
      }
    };
  } catch {
    return { success: false, error: "Invalid URL. Make sure to include the protocol (e.g. https://)" };
  }
}
