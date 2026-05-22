import { dohQuery } from "@/lib/dns";

export interface TlsrptRecord {
  raw: string;
  version: string;
  rua: string[];
  ttl: number;
}

export interface TlsrptOutput {
  success: boolean;
  domain?: string;
  record?: TlsrptRecord;
  error?: string;
}

export async function process(params: unknown): Promise<TlsrptOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const tlsrptDomain = `_smtp._tls.${trimmed}`;
    const ans = await dohQuery(tlsrptDomain, "TXT");
    if (ans.Status === 3 || !ans.Answer?.length) {
      return { success: false, error: "No TLSRPT record found at _smtp._tls.<domain>" };
    }
    const record = ans.Answer?.find((r) => r.data.includes("v=TLSRPTv1"));
    if (!record) return { success: false, error: "No TLSRPTv1 record found" };
    const raw = record.data.replace(/^"|"$/g, "");
    const tags: Record<string, string> = {};
    raw.split(";").forEach((t) => {
      const [k, ...v] = t.trim().split("=");
      if (k) tags[k.trim().toLowerCase()] = v.join("=").trim();
    });
    return {
      success: true,
      domain: trimmed,
      record: {
        raw,
        version: tags["v"] ?? "TLSRPTv1",
        rua: tags["rua"]?.split(",").map((u) => u.trim()) ?? [],
        ttl: record.TTL,
      }
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
