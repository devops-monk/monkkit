export interface WhoisInput {
  domain: string;
}

export interface WhoisOutput {
  success: boolean;
  data?: Record<string, unknown>;
  formatted?: Record<string, string>;
  source?: string;
  error?: string;
}

function extractRdapFields(data: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};

  // Domain name
  if (typeof data.ldhName === "string") out["Domain"] = data.ldhName;
  if (typeof data.handle === "string") out["Handle"] = data.handle;

  // Status
  if (Array.isArray(data.status)) out["Status"] = (data.status as string[]).join(", ");

  // Events (created, updated, expiry)
  if (Array.isArray(data.events)) {
    for (const ev of data.events as { eventAction: string; eventDate: string }[]) {
      const label = {
        registration: "Created",
        expiration: "Expires",
        "last changed": "Updated",
        "last update of RDAP database": "RDAP Updated",
      }[ev.eventAction] ?? ev.eventAction;
      out[label] = new Date(ev.eventDate).toUTCString();
    }
  }

  // Nameservers
  if (Array.isArray(data.nameservers)) {
    out["Nameservers"] = (data.nameservers as { ldhName: string }[])
      .map((ns) => ns.ldhName)
      .join(", ");
  }

  // Registrar
  if (Array.isArray(data.entities)) {
    for (const entity of data.entities as {
      roles?: string[];
      vcardArray?: unknown[];
      publicIds?: { type: string; identifier: string }[];
    }[]) {
      if (!entity.roles) continue;
      const role = (entity.roles as string[]).join("/");
      if (entity.vcardArray && Array.isArray(entity.vcardArray)) {
        const vcards = entity.vcardArray[1] as unknown[][];
        const fn = vcards?.find((v) => Array.isArray(v) && v[0] === "fn");
        if (fn && Array.isArray(fn)) out[`${role} (name)`] = String(fn[3] ?? "");
        const email = vcards?.find((v) => Array.isArray(v) && v[0] === "email");
        if (email && Array.isArray(email)) out[`${role} (email)`] = String(email[3] ?? "");
      }
      if (entity.publicIds) {
        for (const pid of entity.publicIds) {
          out[`${role} (${pid.type})`] = pid.identifier;
        }
      }
    }
  }

  // Links
  if (Array.isArray(data.links)) {
    const self = (data.links as { rel: string; href: string }[]).find((l) => l.rel === "self");
    if (self) out["RDAP URL"] = self.href;
  }

  return out;
}

export async function process(params: unknown): Promise<WhoisOutput> {
  const { domain } = params as WhoisInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Domain is required" };
  try {
    const res = await fetch(`/api/proxy/whois?domain=${encodeURIComponent(trimmed)}`);
    const json = await res.json();
    if (!res.ok || !json.success) {
      return { success: false, error: json.error ?? "WHOIS lookup failed" };
    }
    const formatted = extractRdapFields(json.data as Record<string, unknown>);
    return { success: true, data: json.data, formatted, source: json.source };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
