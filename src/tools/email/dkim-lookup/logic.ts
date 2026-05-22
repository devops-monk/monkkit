import { dohQuery } from "@/lib/dns";

export interface DkimRecord {
  raw: string;
  version?: string;
  keyType?: string;
  publicKey?: string;
  hashAlgos?: string;
  serviceType?: string;
  flags?: string;
  notes?: string;
  ttl: number;
}

export interface DkimOutput {
  success: boolean;
  domain?: string;
  selector?: string;
  record?: DkimRecord;
  error?: string;
}

function parseDkim(raw: string, ttl: number): DkimRecord {
  const tags: Record<string, string> = {};
  raw.split(";").forEach((t) => {
    const [k, ...v] = t.trim().split("=");
    if (k) tags[k.trim().toLowerCase()] = v.join("=").trim();
  });
  return {
    raw,
    version: tags["v"],
    keyType: tags["k"] ?? "rsa",
    publicKey: tags["p"],
    hashAlgos: tags["h"],
    serviceType: tags["s"],
    flags: tags["t"],
    notes: tags["n"],
    ttl,
  };
}

export async function process(params: unknown): Promise<DkimOutput> {
  const { domain, selector } = params as { domain: string; selector: string };
  const trimmedDomain = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  const trimmedSelector = selector?.trim();
  if (!trimmedDomain) return { success: false, error: "Domain is required" };
  if (!trimmedSelector) return { success: false, error: "Selector is required (e.g. 'google', 'selector1', 'mail')" };
  try {
    const dkimDomain = `${trimmedSelector}._domainkey.${trimmedDomain}`;
    const ans = await dohQuery(dkimDomain, "TXT");
    if (ans.Status === 3) return { success: false, error: `No DKIM record found for selector '${trimmedSelector}'` };
    if (ans.Status !== 0) return { success: false, error: `DNS error RCODE ${ans.Status}` };
    const dkimRecord = ans.Answer?.find((r) => {
      const clean = r.data.replace(/^"|"$/g, "");
      return clean.includes("v=DKIM1") || clean.includes("k=rsa") || clean.includes("p=");
    });
    if (!dkimRecord) return { success: false, error: "No DKIM record found" };
    const raw = dkimRecord.data.replace(/^"|"$/g, "").replace(/"\s+"/g, "");
    return { success: true, domain: trimmedDomain, selector: trimmedSelector, record: parseDkim(raw, dkimRecord.TTL) };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
