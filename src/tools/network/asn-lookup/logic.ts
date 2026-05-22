export interface AsnInput {
  input: string; // IP address or ASN (AS12345)
}

export interface AsnOutput {
  success: boolean;
  data?: {
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;
    org?: string;
    asn?: string;
    timezone?: string;
    hostname?: string;
    postal?: string;
  };
  error?: string;
}

export async function process(params: unknown): Promise<AsnOutput> {
  const { input } = params as AsnInput;
  const trimmed = input?.trim();
  if (!trimmed) return { success: false, error: "IP address or ASN is required" };
  try {
    const res = await fetch(`/api/proxy/asn?ip=${encodeURIComponent(trimmed)}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error ?? "ASN lookup failed" };
    }
    return { success: true, data: json.data };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
