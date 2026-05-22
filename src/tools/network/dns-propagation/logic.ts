import { dohQueryAllProviders, type DnsRecordType } from "@/lib/dns";

export interface DnsPropagationInput {
  domain: string;
  type: DnsRecordType;
}

export interface PropagationResult {
  provider: string;
  records: string[];
  status: "ok" | "nxdomain" | "error";
  ttl?: number;
  error?: string;
}

export interface DnsPropagationOutput {
  success: boolean;
  results?: PropagationResult[];
  error?: string;
}

export async function process(params: unknown): Promise<DnsPropagationOutput> {
  const { domain, type = "A" } = params as DnsPropagationInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const raw = await dohQueryAllProviders(trimmed, type);
    const results: PropagationResult[] = Object.entries(raw).map(([provider, answer]) => {
      if ("error" in answer) {
        return { provider, records: [], status: "error", error: answer.error };
      }
      if (answer.Status === 3) {
        return { provider, records: [], status: "nxdomain" };
      }
      const records = answer.Answer?.map((r) => r.data) ?? [];
      const ttl = answer.Answer?.[0]?.TTL;
      return { provider, records, status: "ok", ttl };
    });
    return { success: true, results };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
