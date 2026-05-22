import { dohQuery } from "@/lib/dns";

export interface DmarcRecord {
  raw: string;
  version: string;
  policy: string;
  subdomainPolicy?: string;
  pct?: string;
  rua?: string[];
  ruf?: string[];
  aspf?: string;
  adkim?: string;
  fo?: string;
  rf?: string;
  ri?: string;
  warnings: string[];
  ttl: number;
}

export interface DmarcOutput {
  success: boolean;
  domain?: string;
  record?: DmarcRecord;
  error?: string;
}

function parseDmarc(raw: string, ttl: number): DmarcRecord {
  const tags: Record<string, string> = {};
  raw.split(";").forEach((t) => {
    const [k, ...v] = t.trim().split("=");
    if (k && v.length) tags[k.trim().toLowerCase()] = v.join("=").trim();
  });

  const warnings: string[] = [];
  const policy = tags["p"] ?? "none";
  const pct = tags["pct"] ?? "100";

  if (policy === "none") warnings.push("Policy is 'none' — DMARC is in monitoring mode, emails are not rejected");
  if (pct !== "100") warnings.push(`pct=${pct} — only ${pct}% of failing messages receive policy treatment`);
  if (!tags["rua"]) warnings.push("No aggregate report URI (rua) specified — you won't receive DMARC reports");

  return {
    raw,
    version: tags["v"] ?? "DMARC1",
    policy,
    subdomainPolicy: tags["sp"],
    pct,
    rua: tags["rua"]?.split(",").map((u) => u.trim()),
    ruf: tags["ruf"]?.split(",").map((u) => u.trim()),
    aspf: tags["aspf"] ?? "r",
    adkim: tags["adkim"] ?? "r",
    fo: tags["fo"],
    rf: tags["rf"],
    ri: tags["ri"],
    warnings,
    ttl,
  };
}

export async function process(params: unknown): Promise<DmarcOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const dmarcDomain = `_dmarc.${trimmed}`;
    const ans = await dohQuery(dmarcDomain, "TXT");
    if (ans.Status === 3) return { success: false, error: "No DMARC record found (NXDOMAIN on _dmarc subdomain)" };
    if (ans.Status !== 0) return { success: false, error: `DNS error RCODE ${ans.Status}` };
    const dmarcRecord = ans.Answer?.find((r) => {
      const clean = r.data.replace(/^"|"$/g, "");
      return clean.startsWith("v=DMARC1");
    });
    if (!dmarcRecord) return { success: false, error: "No DMARC record found (no TXT record starting with v=DMARC1)" };
    const raw = dmarcRecord.data.replace(/^"|"$/g, "").replace(/"\s+"/g, " ");
    return { success: true, domain: trimmed, record: parseDmarc(raw, dmarcRecord.TTL) };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
