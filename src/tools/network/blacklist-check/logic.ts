import { dohQuery } from "@/lib/dns";

const RBLS = [
  "zen.spamhaus.org",
  "bl.spamcop.net",
  "dnsbl.sorbs.net",
  "b.barracudacentral.org",
  "dnsbl-1.uceprotect.net",
  "psbl.surriel.com",
  "spam.dnsbl.sorbs.net",
  "ix.dnsbl.manitu.net",
  "cbl.abuseat.org",
  "pbl.spamhaus.org",
  "sbl.spamhaus.org",
  "xbl.spamhaus.org",
  "db.wpbl.info",
  "0spam.fusionzero.com",
  "spam.rbl.msrbl.net",
];

export interface BlacklistResult {
  rbl: string;
  listed: boolean;
  response?: string;
  error?: string;
}

export interface BlacklistInput {
  input: string; // IP address or hostname
}

export interface BlacklistOutput {
  success: boolean;
  ip?: string;
  results?: BlacklistResult[];
  listedCount?: number;
  totalChecked?: number;
  error?: string;
}

function reverseIp(ip: string): string {
  return ip.split(".").reverse().join(".");
}

export async function process(params: unknown): Promise<BlacklistOutput> {
  const { input } = params as BlacklistInput;
  const trimmed = input?.trim();
  if (!trimmed) return { success: false, error: "IP address is required" };

  // Validate IPv4
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(trimmed)) {
    return { success: false, error: "Only IPv4 addresses are supported for blacklist checks" };
  }

  const reversed = reverseIp(trimmed);

  const results = await Promise.allSettled(
    RBLS.map(async (rbl): Promise<BlacklistResult> => {
      const lookup = `${reversed}.${rbl}`;
      try {
        const ans = await dohQuery(lookup, "A");
        if (ans.Status === 0 && ans.Answer && ans.Answer.length > 0) {
          return { rbl, listed: true, response: ans.Answer[0].data };
        }
        return { rbl, listed: false };
      } catch (e) {
        return { rbl, listed: false, error: (e as Error).message };
      }
    })
  );

  const finalResults: BlacklistResult[] = results.map((r) =>
    r.status === "fulfilled" ? r.value : { rbl: "unknown", listed: false, error: "timeout" }
  );

  const listedCount = finalResults.filter((r) => r.listed).length;

  return {
    success: true,
    ip: trimmed,
    results: finalResults,
    listedCount,
    totalChecked: finalResults.length,
  };
}
