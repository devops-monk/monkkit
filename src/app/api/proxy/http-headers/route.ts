import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")?.trim();
  if (!url) return Response.json({ error: "url parameter required" }, { status: 400 });

  let targetUrl = url;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = "https://" + targetUrl;
  }

  try {
    const start = Date.now();
    const res = await fetch(targetUrl, {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    const duration = Date.now() - start;

    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => { headers[key] = value; });

    return Response.json({
      success: true,
      url: targetUrl,
      status: res.status,
      statusText: res.statusText,
      duration,
      headers,
      redirected: res.redirected,
    });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
