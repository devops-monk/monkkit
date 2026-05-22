export type DnsRecordType =
  | "A" | "AAAA" | "MX" | "CNAME" | "TXT" | "NS" | "SOA"
  | "SRV" | "PTR" | "CAA" | "DNSKEY" | "DS" | "NAPTR"
  | "RRSIG" | "NSEC" | "NSEC3PARAM" | "CERT" | "LOC" | "IPSECKEY";

export interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface DnsAnswer {
  Status: number; // 0 = NOERROR, 3 = NXDOMAIN
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: { name: string; type: number }[];
  Answer?: DnsRecord[];
  Authority?: DnsRecord[];
  Comment?: string;
}

const DOH_PROVIDERS: Record<string, string> = {
  Google: "https://dns.google/resolve",
  Cloudflare: "https://cloudflare-dns.com/dns-query",
  "Quad9": "https://dns.quad9.net:5053/dns-query",
};

export async function dohQuery(
  name: string,
  type: DnsRecordType,
  provider: keyof typeof DOH_PROVIDERS = "Google"
): Promise<DnsAnswer> {
  const base = DOH_PROVIDERS[provider] ?? DOH_PROVIDERS.Google;
  const url = `${base}?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(url, {
    headers: { Accept: "application/dns-json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`DoH query failed: ${res.status}`);
  return res.json();
}

export async function dohQueryAllProviders(
  name: string,
  type: DnsRecordType
): Promise<Record<string, DnsAnswer | { error: string }>> {
  const results: Record<string, DnsAnswer | { error: string }> = {};
  await Promise.allSettled(
    Object.keys(DOH_PROVIDERS).map(async (provider) => {
      try {
        results[provider] = await dohQuery(name, type, provider as keyof typeof DOH_PROVIDERS);
      } catch (e) {
        results[provider] = { error: (e as Error).message };
      }
    })
  );
  return results;
}

export const DOH_PROVIDER_NAMES = Object.keys(DOH_PROVIDERS);

export function statusToString(status: number): string {
  const map: Record<number, string> = {
    0: "NOERROR", 1: "FORMERR", 2: "SERVFAIL", 3: "NXDOMAIN",
    4: "NOTIMP", 5: "REFUSED", 6: "YXDOMAIN", 7: "YXRRSET",
    8: "NXRRSET", 9: "NOTAUTH", 10: "NOTZONE",
  };
  return map[status] ?? `RCODE${status}`;
}
