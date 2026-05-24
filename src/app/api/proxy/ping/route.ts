import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim();
  if (!host) return Response.json({ error: "host parameter required" }, { status: 400 });

  const clean = host.replace(/^https?:\/\//, "").split("/")[0];
  const url = `https://${clean}`;

  const attempts: { seq: number; ms: number | null; error?: string }[] = [];

  for (let i = 0; i < 4; i++) {
    const start = Date.now();
    try {
      await fetch(url, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      attempts.push({ seq: i + 1, ms: Date.now() - start });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("timeout") || msg.includes("aborted")) {
        attempts.push({ seq: i + 1, ms: null, error: "Request timeout" });
      } else {
        attempts.push({ seq: i + 1, ms: Date.now() - start, error: msg });
      }
    }
    if (i < 3) await new Promise((r) => setTimeout(r, 300));
  }

  const successful = attempts.filter((a) => a.ms !== null && !a.error);
  const avgMs = successful.length
    ? Math.round(successful.reduce((s, a) => s + a.ms!, 0) / successful.length)
    : null;
  const minMs = successful.length ? Math.min(...successful.map((a) => a.ms!)) : null;
  const maxMs = successful.length ? Math.max(...successful.map((a) => a.ms!)) : null;
  const loss = Math.round(((4 - successful.length) / 4) * 100);

  return Response.json({
    success: true,
    host: clean,
    attempts,
    stats: { sent: 4, received: successful.length, loss, avgMs, minMs, maxMs },
  });
}