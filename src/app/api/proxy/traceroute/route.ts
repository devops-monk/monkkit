import { NextRequest } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function parseTraceroute(output: string): { hop: number; host: string; ms: (number | null)[] }[] {
  const hops: { hop: number; host: string; ms: (number | null)[] }[] = [];
  const lines = output.split("\n").slice(1);
  for (const line of lines) {
    const m = line.match(/^\s*(\d+)\s+(.*)/);
    if (!m) continue;
    const hop = parseInt(m[1], 10);
    const rest = m[2];
    if (rest.trim().startsWith("*")) {
      hops.push({ hop, host: "*", ms: [null, null, null] });
      continue;
    }
    const hostMatch = rest.match(/([^\s]+)\s+\(([^)]+)\)|([^\s]+)/);
    const host = hostMatch ? (hostMatch[2] ?? hostMatch[1] ?? hostMatch[3]) : "*";
    const times = [...rest.matchAll(/([\d.]+)\s*ms/g)].map((t) => parseFloat(t[1]));
    while (times.length < 3) times.push(null as unknown as number);
    hops.push({ hop, host: host ?? "*", ms: times.slice(0, 3) });
  }
  return hops;
}

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim();
  if (!host) return Response.json({ error: "host parameter required" }, { status: 400 });

  const clean = host.replace(/^https?:\/\//, "").split("/")[0];
  if (!/^[a-zA-Z0-9._-]+$/.test(clean)) {
    return Response.json({ error: "Invalid host" }, { status: 400 });
  }

  const isWin = process.platform === "win32";
  const cmd = isWin ? `tracert -d -h 15 ${clean}` : `traceroute -n -m 15 -w 2 ${clean}`;

  try {
    const { stdout } = await execAsync(cmd, { timeout: 30000 });
    const hops = parseTraceroute(stdout);
    return Response.json({ success: true, host: clean, hops, raw: stdout });
  } catch (e) {
    const err = e as { stdout?: string; message: string };
    if (err.stdout) {
      const hops = parseTraceroute(err.stdout);
      if (hops.length > 0) return Response.json({ success: true, host: clean, hops, raw: err.stdout });
    }
    return Response.json({ error: err.message ?? "Traceroute failed" }, { status: 500 });
  }
}
