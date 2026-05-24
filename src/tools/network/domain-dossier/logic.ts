import { dohQuery } from "@/lib/dns";

export interface DomainDossierInput {
  domain: string;
}

export interface DomainDossierOutput {
  success: boolean;
  domain?: string;
  whois?: Record<string, string>;
  dns?: Record<string, string[]>;
  geoip?: Record<string, string>;
  error?: string;
}

async function fetchWhois(domain: string): Promise<Record<string, string>> {
  const res = await fetch(`/api/proxy/whois?domain=${encodeURIComponent(domain)}`);
  const json = await res.json();
  if (!json.success) return {};
  const d = json.data as Record<string, unknown>;
  const out: Record<string, string> = {};
  if (typeof d.ldhName === "string") out["Domain"] = d.ldhName;
  if (Array.isArray(d.status)) out["Status"] = (d.status as string[]).join(", ");
  const events = (d.events ?? []) as { eventAction: string; eventDate: string }[];
  for (const ev of events) {
    const label = { registration: "Created", expiration: "Expires", "last changed": "Updated" }[ev.eventAction];
    if (label) out[label] = new Date(ev.eventDate).toUTCString();
  }
  if (Array.isArray(d.nameservers)) out["Nameservers"] = (d.nameservers as { ldhName: string }[]).map((ns) => ns.ldhName).join(", ");
  if (Array.isArray(d.entities)) {
    for (const entity of d.entities as { roles?: string[]; vcardArray?: unknown[] }[]) {
      if (!entity.roles?.includes("registrar")) continue;
      const cards = entity.vcardArray?.[1] as unknown[][];
      const fn = cards?.find((v) => Array.isArray(v) && v[0] === "fn");
      if (fn) out["Registrar"] = String(fn[3] ?? "");
    }
  }
  return out;
}

async function fetchGeoip(domain: string): Promise<Record<string, string>> {
  try {
    const aRec = await dohQuery(domain, "A");
    const ip = aRec.Answer?.[0]?.data;
    if (!ip) return {};
    const res = await fetch(`/api/proxy/asn?ip=${encodeURIComponent(ip)}`);
    const json = await res.json();
    if (!json.success) return {};
    const d = json.data as Record<string, string>;
    return {
      "IP": ip,
      "Organization": d.org ?? "",
      "Country": d.country ?? "",
      "City": d.city ?? "",
      "ASN": d.asn ?? "",
      "Hostname": d.hostname ?? "",
    };
  } catch { return {}; }
}

export async function process(params: unknown): Promise<DomainDossierOutput> {
  const { domain } = params as DomainDossierInput;
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Domain is required" };

  try {
    const [whois, geoip, aRec, mxRec, nsRec, txtRec] = await Promise.allSettled([
      fetchWhois(trimmed),
      fetchGeoip(trimmed),
      dohQuery(trimmed, "A"),
      dohQuery(trimmed, "MX"),
      dohQuery(trimmed, "NS"),
      dohQuery(trimmed, "TXT"),
    ]);

    const dns: Record<string, string[]> = {};
    if (aRec.status === "fulfilled") dns["A"] = aRec.value.Answer?.map((r) => r.data) ?? [];
    if (mxRec.status === "fulfilled") dns["MX"] = mxRec.value.Answer?.map((r) => r.data) ?? [];
    if (nsRec.status === "fulfilled") dns["NS"] = nsRec.value.Answer?.map((r) => r.data) ?? [];
    if (txtRec.status === "fulfilled") dns["TXT"] = txtRec.value.Answer?.map((r) => r.data.replace(/^"|"$/g, "")) ?? [];

    return {
      success: true,
      domain: trimmed,
      whois: whois.status === "fulfilled" ? whois.value : {},
      dns,
      geoip: geoip.status === "fulfilled" ? geoip.value : {},
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
