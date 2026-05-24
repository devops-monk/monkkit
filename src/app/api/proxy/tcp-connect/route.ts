import { NextRequest } from "next/server";
import net from "net";

function tcpConnect(
  host: string,
  port: number,
  timeoutMs = 8000
): Promise<{ open: boolean; ms: number; banner: string | null }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let settled = false;
    let banner = "";

    const done = (open: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ open, ms: Date.now() - start, banner: banner.trim() || null });
    };

    socket.setTimeout(timeoutMs);
    socket.connect(port, host, () => {
      // connected — wait briefly for a banner
      setTimeout(() => done(true), 1500);
    });

    socket.on("data", (chunk) => {
      banner += chunk.toString("utf8").replace(/\0/g, "").replace(/[^\x09\x0a\x0d\x20-\x7e]/g, "?");
      if (banner.length > 512) {
        banner = banner.slice(0, 512);
        done(true);
      }
    });

    socket.on("error", () => done(false));
    socket.on("timeout", () => done(banner.length > 0));
    socket.on("close", () => done(socket.destroyed ? banner.length > 0 : false));
  });
}

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim();
  const portStr = req.nextUrl.searchParams.get("port")?.trim();
  if (!host || !portStr) {
    return Response.json({ error: "host and port parameters required" }, { status: 400 });
  }

  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    return Response.json({ error: "Port must be 1–65535" }, { status: 400 });
  }

  const clean = host.replace(/^https?:\/\//, "").split("/")[0];
  if (!/^[a-zA-Z0-9._:[\]-]+$/.test(clean)) {
    return Response.json({ error: "Invalid host" }, { status: 400 });
  }

  try {
    const result = await tcpConnect(clean, port);
    return Response.json({ success: true, host: clean, port, ...result });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
