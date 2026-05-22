import { dohQuery } from "@/lib/dns";

export interface BimiRecord {
  raw: string;
  version?: string;
  logoUrl?: string;
  vmcUrl?: string;
  ttl: number;
}

export interface BimiOutput {
  success: boolean;
  domain?: string;
  record?: BimiRecord;
  error?: string;
}

export async function process(params: unknown): Promise<BimiOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const bimiDomain = `default._bimi.${trimmed}`;
    const ans = await dohQuery(bimiDomain, "TXT");
    if (ans.Status === 3) return { success: false, error: "No BIMI record found — publish a TXT record at default._bimi.<domain>" };
    if (ans.Status !== 0) return { success: false, error: `DNS error RCODE ${ans.Status}` };
    const bimiRecord = ans.Answer?.find((r) => {
      const clean = r.data.replace(/^"|"$/g, "");
      return clean.startsWith("v=BIMI1");
    });
    if (!bimiRecord) return { success: false, error: "No BIMI1 record found" };
    const raw = bimiRecord.data.replace(/^"|"$/g, "").replace(/"\s+"/g, " ");
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
        version: tags["v"],
        logoUrl: tags["l"],
        vmcUrl: tags["a"],
        ttl: bimiRecord.TTL,
      }
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
