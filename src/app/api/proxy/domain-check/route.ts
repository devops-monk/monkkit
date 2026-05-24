import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get("domain")?.toLowerCase().trim();
  if (!domain) return Response.json({ error: "domain parameter required" }, { status: 400 });

  const clean = domain.replace(/^https?:\/\//, "").split("/")[0];

  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(clean)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      return Response.json({ success: true, available: true, domain: clean });
    }

    if (res.ok) {
      const data = await res.json();
      const events = (data.events ?? []) as { eventAction: string; eventDate: string }[];
      const created = events.find((e) => e.eventAction === "registration")?.eventDate;
      const expires = events.find((e) => e.eventAction === "expiration")?.eventDate;
      const registrar = (data.entities ?? []).find((e: { roles?: string[] }) => e.roles?.includes("registrar"));
      const registrarName = registrar?.vcardArray?.[1]?.find((v: unknown[]) => v[0] === "fn")?.[3] ?? null;
      return Response.json({
        success: true,
        available: false,
        domain: clean,
        status: data.status ?? [],
        created: created ? new Date(created).toUTCString() : null,
        expires: expires ? new Date(expires).toUTCString() : null,
        registrar: registrarName,
        nameservers: (data.nameservers ?? []).map((ns: { ldhName: string }) => ns.ldhName),
      });
    }

    return Response.json({ success: false, error: `RDAP returned ${res.status}` }, { status: 502 });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}