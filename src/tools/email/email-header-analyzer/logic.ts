export interface EmailHeaderInput {
  headers: string;
}

export interface ParsedHeader {
  name: string;
  value: string;
}

export interface ReceivedHop {
  from?: string;
  by?: string;
  with?: string;
  id?: string;
  timestamp?: string;
  delay?: number;
  raw: string;
}

export interface EmailHeaderOutput {
  success: boolean;
  headers?: ParsedHeader[];
  summary?: {
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
    messageId?: string;
    replyTo?: string;
    returnPath?: string;
    spfResult?: string;
    dkimResult?: string;
    dmarcResult?: string;
    xMailer?: string;
    contentType?: string;
  };
  hops?: ReceivedHop[];
  totalDelay?: number;
  error?: string;
}

function parseDate(d: string): Date | null {
  try { return new Date(d); } catch { return null; }
}

export function process(params: unknown): EmailHeaderOutput {
  const { headers: raw } = params as EmailHeaderInput;
  if (!raw?.trim()) return { success: false, error: "Email headers are required" };

  try {
    // Unfold multi-line headers (RFC 2822 folded headers)
    const unfolded = raw.replace(/\r?\n([ \t]+)/g, " ");
    const lines = unfolded.split(/\r?\n/);
    const parsed: ParsedHeader[] = [];

    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.*)/);
      if (match) parsed.push({ name: match[1].trim(), value: match[2].trim() });
    }

    const get = (name: string) =>
      parsed.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
    const getAll = (name: string) =>
      parsed.filter((h) => h.name.toLowerCase() === name.toLowerCase()).map((h) => h.value);

    const summary = {
      from: get("From"),
      to: get("To"),
      subject: get("Subject"),
      date: get("Date"),
      messageId: get("Message-ID"),
      replyTo: get("Reply-To"),
      returnPath: get("Return-Path"),
      spfResult: get("Received-SPF") ?? get("Authentication-Results")?.match(/spf=(\w+)/i)?.[1],
      dkimResult: get("Authentication-Results")?.match(/dkim=(\w+)/i)?.[1],
      dmarcResult: get("Authentication-Results")?.match(/dmarc=(\w+)/i)?.[1],
      xMailer: get("X-Mailer"),
      contentType: get("Content-Type"),
    };

    // Parse Received headers into delivery hops
    const receivedHeaders = getAll("Received").reverse();
    let prevTime: Date | null = null;
    const hops: ReceivedHop[] = receivedHeaders.map((r) => {
      const fromMatch = r.match(/from\s+([\w.\-\[\]:]+(?:\s+\([^)]+\))?)/i);
      const byMatch = r.match(/by\s+([\w.\-]+)/i);
      const withMatch = r.match(/with\s+([\w]+)/i);
      const idMatch = r.match(/id\s+([\w.@\-+/]+)/i);
      const forMatch = r.match(/for\s+(<[^>]+>|\S+)/i);
      const dateStr = r.match(/;\s*(.+)$/)?.[1];
      const ts = dateStr ? parseDate(dateStr) : null;
      let delay: number | undefined;
      if (ts && prevTime) {
        delay = Math.max(0, Math.round((ts.getTime() - prevTime.getTime()) / 1000));
      }
      prevTime = ts;
      return {
        from: fromMatch?.[1],
        by: byMatch?.[1],
        with: withMatch?.[1],
        id: idMatch?.[1],
        timestamp: ts?.toUTCString(),
        delay,
        raw: r,
      };
    });

    const totalDelay = hops.reduce((s, h) => s + (h.delay ?? 0), 0);

    return { success: true, headers: parsed, summary, hops, totalDelay };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
