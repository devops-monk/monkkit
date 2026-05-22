import { dohQuery } from "@/lib/dns";

export interface SpfRecord {
  raw: string;
  version: string;
  mechanisms: SpfMechanism[];
  modifiers: Record<string, string>;
  warnings: string[];
  ttl: number;
}

export interface SpfMechanism {
  qualifier: "+" | "-" | "~" | "?";
  type: string;
  value?: string;
  description: string;
}

export interface SpfOutput {
  success: boolean;
  domain?: string;
  record?: SpfRecord;
  error?: string;
}

function parseSpf(raw: string, ttl: number): SpfRecord {
  const parts = raw.split(/\s+/);
  const mechanisms: SpfMechanism[] = [];
  const modifiers: Record<string, string> = {};
  const warnings: string[] = [];
  const version = parts[0];

  const qualifierMap: Record<string, SpfMechanism["qualifier"]> = {
    "+": "+", "-": "-", "~": "~", "?": "?",
  };

  const descMap: Record<string, string> = {
    all: "Match all (catch-all)",
    include: "Include another SPF record",
    a: "A/AAAA records of domain",
    mx: "MX records of domain",
    ptr: "PTR record (deprecated, avoid)",
    ip4: "Allow IPv4 range",
    ip6: "Allow IPv6 range",
    exists: "Domain exists check",
    redirect: "Redirect to another SPF",
    exp: "Explanation string",
  };

  let lookupCount = 0;

  for (const part of parts.slice(1)) {
    if (part.includes("=")) {
      const [key, ...rest] = part.split("=");
      modifiers[key] = rest.join("=");
      continue;
    }
    const qualChar = part[0];
    const qualifier = qualifierMap[qualChar] ?? "+";
    const mech = qualChar in qualifierMap ? part.slice(1) : part;
    const [type, ...rest] = mech.split(":");
    const value = rest.join(":") || undefined;
    const description = descMap[type.toLowerCase()] ?? type;

    if (["include", "a", "mx", "exists", "redirect"].includes(type.toLowerCase())) lookupCount++;
    mechanisms.push({ qualifier, type: type.toLowerCase(), value, description });
  }

  if (lookupCount > 10) warnings.push(`SPF lookup count is ${lookupCount} — exceeds the 10-lookup RFC limit`);
  if (mechanisms.length === 0) warnings.push("SPF record has no mechanisms");
  const allMech = mechanisms.find((m) => m.type === "all");
  if (!allMech) warnings.push("No 'all' mechanism — SPF record is incomplete");
  else if (allMech.qualifier === "+") warnings.push("+all allows all senders — this SPF record provides no protection");

  return { raw, version, mechanisms, modifiers, warnings, ttl };
}

export async function process(params: unknown): Promise<SpfOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const ans = await dohQuery(trimmed, "TXT");
    if (ans.Status === 3) return { success: false, error: "NXDOMAIN — domain does not exist" };
    if (ans.Status !== 0) return { success: false, error: `DNS error RCODE ${ans.Status}` };
    const spfRecord = ans.Answer?.find((r) => {
      const clean = r.data.replace(/^"|"$/g, "").replace(/"\s+"/g, "");
      return clean.startsWith("v=spf1");
    });
    if (!spfRecord) return { success: false, error: "No SPF record found (no TXT record starting with v=spf1)" };
    const raw = spfRecord.data.replace(/^"|"$/g, "").replace(/"\s+"/g, " ");
    return { success: true, domain: trimmed, record: parseSpf(raw, spfRecord.TTL) };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
