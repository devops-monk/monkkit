import { dohQuery } from "@/lib/dns";

export interface DkimLookupInput {
  domain: string;
  selector: string;
}

export interface DkimLookupOutput {
  success: boolean;
  domain?: string;
  selector?: string;
  record?: string;
  fields?: Record<string, string>;
  error?: string;
}

const FIELD_LABELS: Record<string, string> = {
  v: "Version",
  k: "Key Type",
  p: "Public Key",
  h: "Hash Algorithms",
  s: "Service Type",
  t: "Flags",
  n: "Notes",
};

function parseDkim(record: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of record.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    const label = FIELD_LABELS[key] ?? key;
    out[label] = key === "p" && val.length > 60 ? val.slice(0, 40) + "…" + val.slice(-20) : val;
  }
  return out;
}

export async function process(params: unknown): Promise<DkimLookupOutput> {
  const { domain, selector = "default" } = params as DkimLookupInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  const sel = selector?.trim() || "default";
  if (!trimmed) return { success: false, error: "Domain is required" };

  const dkimDomain = `${sel}._domainkey.${trimmed}`;

  try {
    const answer = await dohQuery(dkimDomain, "TXT");
    if (answer.Status !== 0 || !answer.Answer?.length) {
      return { success: false, error: `No DKIM record found at ${dkimDomain}` };
    }
    const record = answer.Answer.map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s+"/g, "")).join("");
    return {
      success: true,
      domain: trimmed,
      selector: sel,
      record,
      fields: parseDkim(record),
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
