export interface PingInput {
  host: string;
}

export interface PingAttempt {
  seq: number;
  ms: number | null;
  error?: string;
}

export interface PingOutput {
  success: boolean;
  host?: string;
  attempts?: PingAttempt[];
  stats?: { sent: number; received: number; loss: number; avgMs: number | null; minMs: number | null; maxMs: number | null };
  error?: string;
}

export async function process(params: unknown): Promise<PingOutput> {
  const { host } = params as PingInput;
  const trimmed = host?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Host is required" };

  try {
    const res = await fetch(`/api/proxy/ping?host=${encodeURIComponent(trimmed)}`);
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? "Ping failed" };
    return json;
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
