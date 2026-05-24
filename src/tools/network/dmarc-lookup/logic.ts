import { dohQuery } from "@/lib/dns";

export interface DmarcLookupInput {
  domain: string;
}

export interface DmarcLookupOutput {
  success: boolean;
  domain?: string;
  record?: string;
  policy?: string;
  subdomainPolicy?: string | null;
  percentage?: number;
  reportingUris?: string[];
  forensicUris?: string[];
  alignment?: { dkim: string; spf: string };
  fields?: Record<string, string>;
  error?: string;
}

const POLICY_MAP: Record<string, string> = {
  none: "None (monitor only, no action)",
  quarantine: "Quarantine (mark as spam)",
  reject: "Reject (block email)",
};

const TAG_LABELS: Record<string, string> = {
  v: "Version",
  p: "Policy",
  sp: "Subdomain Policy",
  pct: "Percentage",
  rua: "Aggregate Report URI",
  ruf: "Forensic Report URI",
  adkim: "DKIM Alignment",
  aspf: "SPF Alignment",
  fo: "Failure Options",
  rf: "Report Format",
  ri: "Report Interval",
};

function parseDmarc(record: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of record.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    const label = TAG_LABELS[key] ?? key;
    out[label] = val;
  }
  return out;
}

export async function process(params: unknown): Promise<DmarcLookupOutput> {
  const { domain } = params as DmarcLookupInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Domain is required" };

  const dmarcDomain = `_dmarc.${trimmed}`;

  try {
    const answer = await dohQuery(dmarcDomain, "TXT");
    const txts = (answer.Answer ?? []).map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
    const record = txts.find((t) => t.startsWith("v=DMARC1"));
    if (!record) return { success: false, error: `No DMARC record found at ${dmarcDomain}` };

    const fields = parseDmarc(record);
    const tags: Record<string, string> = {};
    for (const part of record.split(";")) {
      const eq = part.indexOf("=");
      if (eq < 0) continue;
      tags[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
    }

    const policy = tags.p;
    const pct = tags.pct ? parseInt(tags.pct, 10) : 100;
    const rua = tags.rua?.split(",").map((u) => u.trim()) ?? [];
    const ruf = tags.ruf?.split(",").map((u) => u.trim()) ?? [];
    const alignMap: Record<string, string> = { r: "Relaxed", s: "Strict" };

    return {
      success: true,
      domain: trimmed,
      record,
      policy: POLICY_MAP[policy] ?? policy,
      subdomainPolicy: tags.sp ? (POLICY_MAP[tags.sp] ?? tags.sp) : null,
      percentage: pct,
      reportingUris: rua,
      forensicUris: ruf,
      alignment: { dkim: alignMap[tags.adkim ?? "r"] ?? tags.adkim, spf: alignMap[tags.aspf ?? "r"] ?? tags.aspf },
      fields,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
