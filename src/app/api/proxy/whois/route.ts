import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.toLowerCase().trim();
  if (!domain) return Response.json({ error: "domain parameter required" }, { status: 400 });

  const cleanDomain = domain.replace(/^https?:\/\//, "").split("/")[0];

  try {
    // Try RDAP first (modern replacement for WHOIS, returns JSON)
    const rdapRes = await fetch(`https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (rdapRes.ok) {
      const data = await rdapRes.json();
      return Response.json({ success: true, source: "rdap", data });
    }

    // Fallback: try IP RDAP if it looks like an IP
    if (/^\d+\.\d+\.\d+\.\d+$/.test(cleanDomain)) {
      const ipRes = await fetch(`https://rdap.org/ip/${cleanDomain}`, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (ipRes.ok) {
        const data = await ipRes.json();
        return Response.json({ success: true, source: "rdap-ip", data });
      }
    }

    return Response.json({ error: "WHOIS/RDAP lookup failed for this domain" }, { status: 502 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
