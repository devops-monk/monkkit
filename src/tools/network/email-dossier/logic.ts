import { dohQuery } from "@/lib/dns";

export interface EmailDossierInput {
  email: string;
}

export interface EmailDossierOutput {
  success: boolean;
  email?: string;
  local?: string;
  domain?: string;
  syntaxValid?: boolean;
  mxRecords?: string[];
  hasMx?: boolean;
  spfRecord?: string | null;
  dmarcRecord?: string | null;
  providerHint?: string | null;
  disposable?: boolean;
  error?: string;
}

const FREE_PROVIDERS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "hotmail.com",
  "outlook.com", "live.com", "msn.com", "icloud.com", "me.com", "mac.com",
  "aol.com", "protonmail.com", "proton.me", "zoho.com", "yandex.com",
  "mail.com", "gmx.com", "gmx.net", "tutanota.com", "fastmail.com",
]);

const DISPOSABLE_PATTERNS = [
  "mailinator.com", "guerrillamail.com", "tempmail.com", "throwam.com",
  "sharklasers.com", "guerrillamailblock.com", "grr.la", "guerrillamail.info",
  "yopmail.com", "dispostable.com", "mailnull.com", "spamgourmet.com",
  "trashmail.com", "trashmail.net", "tempr.email", "discard.email",
];

function validateEmailSyntax(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function process(params: unknown): Promise<EmailDossierOutput> {
  const { email } = params as EmailDossierInput;
  const trimmed = email?.trim().toLowerCase();
  if (!trimmed) return { success: false, error: "Email address is required" };

  const syntaxValid = validateEmailSyntax(trimmed);
  if (!syntaxValid) {
    return { success: true, email: trimmed, syntaxValid: false, hasMx: false };
  }

  const [local, domain] = trimmed.split("@");
  const disposable = DISPOSABLE_PATTERNS.some((p) => domain.endsWith(p));

  let mxRecords: string[] = [];
  let hasMx = false;
  let spfRecord: string | null = null;
  let dmarcRecord: string | null = null;

  try {
    const [mxRes, txtRes, dmarcRes] = await Promise.allSettled([
      dohQuery(domain, "MX"),
      dohQuery(domain, "TXT"),
      dohQuery(`_dmarc.${domain}`, "TXT"),
    ]);

    if (mxRes.status === "fulfilled") {
      mxRecords = (mxRes.value.Answer ?? []).map((r) => r.data).sort();
      hasMx = mxRecords.length > 0;
    }
    if (txtRes.status === "fulfilled") {
      const txts = (txtRes.value.Answer ?? []).map((r) => r.data.replace(/^"|"$/g, ""));
      spfRecord = txts.find((t) => t.startsWith("v=spf1")) ?? null;
    }
    if (dmarcRes.status === "fulfilled") {
      const txts = (dmarcRes.value.Answer ?? []).map((r) => r.data.replace(/^"|"$/g, ""));
      dmarcRecord = txts.find((t) => t.startsWith("v=DMARC1")) ?? null;
    }
  } catch { /* best-effort */ }

  const providerHint = FREE_PROVIDERS.has(domain) ? domain : null;

  return {
    success: true,
    email: trimmed,
    local,
    domain,
    syntaxValid,
    mxRecords,
    hasMx,
    spfRecord,
    dmarcRecord,
    providerHint,
    disposable,
  };
}
