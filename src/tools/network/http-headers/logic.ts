export interface HttpHeadersInput {
  url: string;
}

export interface HttpHeadersOutput {
  success: boolean;
  url?: string;
  status?: number;
  statusText?: string;
  duration?: number;
  headers?: Record<string, string>;
  securityHeaders?: { header: string; present: boolean; value?: string; risk: "pass" | "warn" | "fail" }[];
  error?: string;
}

const SECURITY_HEADERS = [
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "x-xss-protection",
];

export async function process(params: unknown): Promise<HttpHeadersOutput> {
  const { url } = params as HttpHeadersInput;
  if (!url?.trim()) return { success: false, error: "URL is required" };
  try {
    const res = await fetch(`/api/proxy/http-headers?url=${encodeURIComponent(url.trim())}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error ?? "Request failed" };
    }

    const headers: Record<string, string> = json.headers ?? {};
    const securityHeaders = SECURITY_HEADERS.map((h) => {
      const value = headers[h];
      const present = Boolean(value);
      let risk: "pass" | "warn" | "fail" = present ? "pass" : "fail";
      // x-xss-protection is deprecated — warn if missing but don't fail
      if (h === "x-xss-protection" && !present) risk = "warn";
      return { header: h, present, value, risk };
    });

    return {
      success: true,
      url: json.url,
      status: json.status,
      statusText: json.statusText,
      duration: json.duration,
      headers,
      securityHeaders,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
