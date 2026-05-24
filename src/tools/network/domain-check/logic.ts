export interface DomainCheckInput {
  domain: string;
}

export interface DomainCheckOutput {
  success: boolean;
  available?: boolean;
  domain?: string;
  status?: string[];
  created?: string | null;
  expires?: string | null;
  registrar?: string | null;
  nameservers?: string[];
  error?: string;
}

export async function process(params: unknown): Promise<DomainCheckOutput> {
  const { domain } = params as DomainCheckInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].toLowerCase();
  if (!trimmed) return { success: false, error: "Domain is required" };

  try {
    const res = await fetch(`/api/proxy/domain-check?domain=${encodeURIComponent(trimmed)}`);
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? "Domain check failed" };
    return json;
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
