import { dohQuery } from "@/lib/dns";

export interface SpfLookupInput {
  domain: string;
}

export interface SpfMechanism {
  qualifier: "+" | "-" | "~" | "?";
  type: string;
  value: string;
  description: string;
}

export interface SpfLookupOutput {
  success: boolean;
  domain?: string;
  record?: string;
  version?: string;
  mechanisms?: SpfMechanism[];
  redirect?: string;
  exp?: string;
  error?: string;
}

const QUALIFIER_DESC: Record<string, string> = {
  "+": "Pass",
  "-": "Fail",
  "~": "SoftFail",
  "?": "Neutral",
};

function parseMechanisms(record: string): SpfMechanism[] {
  const parts = record.split(/\s+/).slice(1);
  const mechs: SpfMechanism[] = [];
  for (const part of parts) {
    if (part.startsWith("redirect=") || part.startsWith("exp=")) continue;
    const qualifiers = ["+", "-", "~", "?"] as const;
    let qualifier: "+" | "-" | "~" | "?" = "+";
    let rest = part;
    if (qualifiers.includes(part[0] as typeof qualifiers[number])) {
      qualifier = part[0] as typeof qualifier;
      rest = part.slice(1);
    }
    const colonIdx = rest.indexOf(":");
    const type = colonIdx >= 0 ? rest.slice(0, colonIdx) : rest;
    const value = colonIdx >= 0 ? rest.slice(colonIdx + 1) : "";
    const descMap: Record<string, string> = {
      all: "Applies to all IPs not matched by other mechanisms",
      include: `Include SPF record from ${value}`,
      a: value ? `A record of ${value}` : "A record of current domain",
      mx: value ? `MX record of ${value}` : "MX record of current domain",
      ip4: `IPv4 address/range ${value}`,
      ip6: `IPv6 address/range ${value}`,
      ptr: `PTR (reverse DNS) of ${value || "sending IP"}`,
      exists: `Domain ${value} must have an A record`,
    };
    mechs.push({ qualifier, type, value, description: `${QUALIFIER_DESC[qualifier]} — ${descMap[type] ?? type}` });
  }
  return mechs;
}

export async function process(params: unknown): Promise<SpfLookupOutput> {
  const { domain } = params as SpfLookupInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Domain is required" };

  try {
    const answer = await dohQuery(trimmed, "TXT");
    const txts = (answer.Answer ?? []).map((r) => r.data.replace(/^"|"$/g, "").replace(/"\s+"/g, ""));
    const spf = txts.find((t) => t.startsWith("v=spf1"));
    if (!spf) return { success: false, error: "No SPF record found for this domain" };

    const redirect = spf.match(/redirect=([^\s]+)/)?.[1] ?? undefined;
    const exp = spf.match(/exp=([^\s]+)/)?.[1] ?? undefined;

    return {
      success: true,
      domain: trimmed,
      record: spf,
      version: "spf1",
      mechanisms: parseMechanisms(spf),
      redirect,
      exp,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
