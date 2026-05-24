export interface TcpConnectInput {
  host: string;
  port: string | number;
}

export interface TcpConnectOutput {
  success: boolean;
  host?: string;
  port?: number;
  open?: boolean;
  ms?: number;
  banner?: string | null;
  error?: string;
}

export const WELL_KNOWN_PORTS: Record<number, string> = {
  21: "FTP", 22: "SSH", 23: "Telnet", 25: "SMTP", 53: "DNS",
  80: "HTTP", 110: "POP3", 143: "IMAP", 443: "HTTPS", 465: "SMTPS",
  587: "SMTP Submission", 993: "IMAPS", 995: "POP3S",
  3306: "MySQL", 3389: "RDP", 5432: "PostgreSQL",
  6379: "Redis", 8080: "HTTP Alt", 8443: "HTTPS Alt",
  27017: "MongoDB", 11211: "Memcached", 9200: "Elasticsearch",
};

export async function process(params: unknown): Promise<TcpConnectOutput> {
  const { host, port } = params as TcpConnectInput;
  const trimmed = host?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Host is required" };
  const portNum = parseInt(String(port), 10);
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    return { success: false, error: "Port must be 1–65535" };
  }

  try {
    const res = await fetch(`/api/proxy/tcp-connect?host=${encodeURIComponent(trimmed)}&port=${portNum}`);
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? "Connection failed" };
    return json;
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
