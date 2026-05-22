import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ip = req.nextUrl.searchParams.get("ip")?.trim();
  if (!ip) return Response.json({ error: "ip parameter required" }, { status: 400 });

  try {
    const res = await fetch(`https://ipinfo.io/${ip}/json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`ipinfo.io returned ${res.status}`);
    const data = await res.json();
    return Response.json({ success: true, data });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
