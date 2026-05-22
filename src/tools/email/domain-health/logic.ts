import { dohQuery } from "@/lib/dns";

export interface DomainHealthCheck {
  name: string;
  status: "pass" | "fail" | "warn" | "loading";
  message: string;
  value?: string;
}

export interface DomainHealthOutput {
  success: boolean;
  domain?: string;
  checks?: DomainHealthCheck[];
  score?: number;
  error?: string;
}

export async function process(params: unknown): Promise<DomainHealthOutput> {
  const { domain } = params as { domain: string };
  const trimmed = domain?.trim().replace(/^https?:\/\//, "").split("/")[0].split("@").pop()!;
  if (!trimmed) return { success: false, error: "Domain is required" };

  const checks: DomainHealthCheck[] = [];

  await Promise.allSettled([
    // MX Check
    dohQuery(trimmed, "MX").then((ans) => {
      if (ans.Status === 0 && ans.Answer?.length) {
        const mx = ans.Answer.map((r) => r.data.split(" ").slice(1).join(" ")).join(", ");
        checks.push({ name: "MX Records", status: "pass", message: `${ans.Answer.length} MX record(s) found`, value: mx });
      } else {
        checks.push({ name: "MX Records", status: "fail", message: "No MX records found — domain cannot receive email" });
      }
    }).catch(() => checks.push({ name: "MX Records", status: "fail", message: "MX lookup failed" })),

    // SPF Check
    dohQuery(trimmed, "TXT").then((ans) => {
      const spf = ans.Answer?.find((r) => r.data.includes("v=spf1"));
      if (spf) {
        const raw = spf.data.replace(/^"|"$/g, "");
        const hasAll = raw.includes("all");
        const isNegative = raw.includes("-all") || raw.includes("~all");
        checks.push({
          name: "SPF Record",
          status: hasAll && isNegative ? "pass" : "warn",
          message: hasAll && isNegative ? "SPF record found with restrictive policy" : "SPF found but policy is permissive (+all or ?all)",
          value: raw,
        });
      } else {
        checks.push({ name: "SPF Record", status: "fail", message: "No SPF record found" });
      }
    }).catch(() => checks.push({ name: "SPF Record", status: "fail", message: "SPF lookup failed" })),

    // DMARC Check
    dohQuery(`_dmarc.${trimmed}`, "TXT").then((ans) => {
      const dmarc = ans.Answer?.find((r) => r.data.includes("v=DMARC1"));
      if (dmarc) {
        const raw = dmarc.data.replace(/^"|"$/g, "");
        const pMatch = raw.match(/p=(\w+)/i);
        const p = pMatch?.[1] ?? "none";
        checks.push({
          name: "DMARC Record",
          status: p === "reject" ? "pass" : p === "quarantine" ? "warn" : "warn",
          message: `DMARC found with policy=${p}${p === "none" ? " (monitoring only)" : ""}`,
          value: raw,
        });
      } else {
        checks.push({ name: "DMARC Record", status: "fail", message: "No DMARC record found" });
      }
    }).catch(() => checks.push({ name: "DMARC Record", status: "fail", message: "DMARC lookup failed" })),

    // BIMI Check
    dohQuery(`default._bimi.${trimmed}`, "TXT").then((ans) => {
      const bimi = ans.Answer?.find((r) => r.data.includes("v=BIMI1"));
      if (bimi) {
        checks.push({ name: "BIMI Record", status: "pass", message: "BIMI record found", value: bimi.data });
      } else {
        checks.push({ name: "BIMI Record", status: "warn", message: "No BIMI record (optional brand indicator)" });
      }
    }).catch(() => checks.push({ name: "BIMI Record", status: "warn", message: "BIMI check skipped" })),

    // MTA-STS Check
    dohQuery(`_mta-sts.${trimmed}`, "TXT").then((ans) => {
      const sts = ans.Answer?.find((r) => r.data.includes("v=STSv1"));
      if (sts) {
        checks.push({ name: "MTA-STS", status: "pass", message: "MTA-STS record found", value: sts.data });
      } else {
        checks.push({ name: "MTA-STS", status: "warn", message: "No MTA-STS record (optional TLS enforcement)" });
      }
    }).catch(() => checks.push({ name: "MTA-STS", status: "warn", message: "MTA-STS check skipped" })),

    // TLSRPT Check
    dohQuery(`_smtp._tls.${trimmed}`, "TXT").then((ans) => {
      const tls = ans.Answer?.find((r) => r.data.includes("v=TLSRPTv1"));
      if (tls) {
        checks.push({ name: "TLSRPT", status: "pass", message: "TLSRPT record found", value: tls.data });
      } else {
        checks.push({ name: "TLSRPT", status: "warn", message: "No TLSRPT record (optional TLS reporting)" });
      }
    }).catch(() => checks.push({ name: "TLSRPT", status: "warn", message: "TLSRPT check skipped" })),

    // NS Check
    dohQuery(trimmed, "NS").then((ans) => {
      if (ans.Status === 0 && ans.Answer?.length) {
        const ns = ans.Answer.map((r) => r.data.replace(/\.$/, "")).join(", ");
        checks.push({ name: "Nameservers", status: "pass", message: `${ans.Answer.length} nameserver(s) found`, value: ns });
      } else {
        checks.push({ name: "Nameservers", status: "warn", message: "Could not retrieve NS records" });
      }
    }).catch(() => checks.push({ name: "Nameservers", status: "warn", message: "NS lookup failed" })),
  ]);

  const passed = checks.filter((c) => c.status === "pass").length;
  const score = Math.round((passed / checks.length) * 100);

  return { success: true, domain: trimmed, checks, score };
}
