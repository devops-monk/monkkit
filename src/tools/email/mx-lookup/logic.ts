import { dohQuery } from "@/lib/dns";

export interface MxRecord {
  priority: number;
  exchange: string;
  ttl: number;
}

export interface MxOutput {
  success: boolean;
  domain?: string;
  records?: MxRecord[];
  error?: string;
}

export async function process(params: unknown): Promise<MxOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const ans = await dohQuery(trimmed, "MX");
    if (ans.Status === 3) return { success: false, error: "NXDOMAIN — domain does not exist" };
    if (ans.Status !== 0) return { success: false, error: `DNS error RCODE ${ans.Status}` };
    if (!ans.Answer || ans.Answer.length === 0) {
      return { success: false, error: "No MX records found for this domain" };
    }
    const records: MxRecord[] = ans.Answer.map((r) => {
      const parts = r.data.trim().split(/\s+/);
      const priority = parseInt(parts[0], 10);
      const exchange = parts[1]?.replace(/\.$/, "") ?? r.data;
      return { priority, exchange, ttl: r.TTL };
    }).sort((a, b) => a.priority - b.priority);
    return { success: true, domain: trimmed, records };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
