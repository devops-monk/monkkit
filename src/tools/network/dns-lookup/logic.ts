import { dohQuery, type DnsRecordType, type DnsAnswer } from "@/lib/dns";

export interface DnsLookupInput {
  domain: string;
  type: DnsRecordType;
}

export interface DnsLookupOutput {
  success: boolean;
  answer?: DnsAnswer;
  records?: string[];
  error?: string;
}

export async function process(params: unknown): Promise<DnsLookupOutput> {
  const { domain, type = "A" } = params as DnsLookupInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const answer = await dohQuery(trimmed, type);
    if (answer.Status !== 0) {
      const statusMap: Record<number, string> = {
        3: "NXDOMAIN — domain does not exist",
        2: "SERVFAIL — server failure",
        1: "FORMERR — format error",
        5: "REFUSED — query refused",
      };
      return { success: false, error: statusMap[answer.Status] ?? `DNS error: RCODE ${answer.Status}` };
    }
    const records = answer.Answer?.map((r) => r.data) ?? [];
    return { success: true, answer, records };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
