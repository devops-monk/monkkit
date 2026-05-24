export interface TracerouteInput {
  host: string;
}

export interface TracerouteHop {
  hop: number;
  host: string;
  ms: (number | null)[];
}

export interface TracerouteOutput {
  success: boolean;
  host?: string;
  hops?: TracerouteHop[];
  raw?: string;
  error?: string;
}

export async function process(params: unknown): Promise<TracerouteOutput> {
  const { host } = params as TracerouteInput;
  const trimmed = host?.trim().replace(/^https?:\/\//, "").split("/")[0];
  if (!trimmed) return { success: false, error: "Host is required" };

  try {
    const res = await fetch(`/api/proxy/traceroute?host=${encodeURIComponent(trimmed)}`);
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? "Traceroute failed" };
    return json;
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
