import { dohQuery } from "@/lib/dns";

export interface MtaStsOutput {
  success: boolean;
  domain?: string;
  dnsRecord?: { raw: string; version: string; id: string; ttl: number };
  policy?: Record<string, string>;
  policyError?: string;
  error?: string;
}

export async function process(params: unknown): Promise<MtaStsOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const stsDomain = `_mta-sts.${trimmed}`;
    const ans = await dohQuery(stsDomain, "TXT");
    if (ans.Status === 3 || !ans.Answer?.length) {
      return { success: false, error: "No MTA-STS DNS record found — publish a TXT record at _mta-sts.<domain>" };
    }
    const stsRecord = ans.Answer?.find((r) => r.data.includes("v=STSv1"));
    if (!stsRecord) return { success: false, error: "No MTA-STS (v=STSv1) record found" };
    const raw = stsRecord.data.replace(/^"|"$/g, "");
    const tags: Record<string, string> = {};
    raw.split(";").forEach((t) => {
      const [k, ...v] = t.trim().split("=");
      if (k) tags[k.trim().toLowerCase()] = v.join("=").trim();
    });

    // Try to fetch the policy file
    let policy: Record<string, string> | undefined;
    let policyError: string | undefined;
    try {
      const policyRes = await fetch(`https://mta-sts.${trimmed}/.well-known/mta-sts.txt`, {
        signal: AbortSignal.timeout(5000),
      });
      if (policyRes.ok) {
        const text = await policyRes.text();
        policy = {};
        text.split("\n").forEach((line) => {
          const [k, ...v] = line.split(":");
          if (k && v.length) policy![k.trim().toLowerCase()] = v.join(":").trim();
        });
      } else {
        policyError = `Policy file returned HTTP ${policyRes.status}`;
      }
    } catch {
      policyError = "Could not fetch policy file (CORS or network error)";
    }

    return {
      success: true,
      domain: trimmed,
      dnsRecord: { raw, version: tags["v"] ?? "STSv1", id: tags["id"] ?? "", ttl: stsRecord.TTL },
      policy,
      policyError,
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
