import { NextRequest } from "next/server";
import net from "net";

function tcpCheck(host: string, port: number, timeoutMs = 5000): Promise<{ open: boolean; ms: number }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let settled = false;

    const done = (open: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ open, ms: Date.now() - start });
    };

    socket.setTimeout(timeoutMs);
    socket.connect(port, host, () => done(true));
    socket.on("error", () => done(false));
    socket.on("timeout", () => done(false));
  });
}

export async function GET(req: NextRequest) {
  const host = req.nextUrl.searchParams.get("host")?.trim();
  const portStr = req.nextUrl.searchParams.get("port")?.trim();
  if (!host || !portStr) return Response.json({ error: "host and port parameters required" }, { status: 400 });

  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    return Response.json({ error: "Port must be 1–65535" }, { status: 400 });
  }

  const clean = host.replace(/^https?:\/\//, "").split("/")[0];

  try {
    const result = await tcpCheck(clean, port);
    return Response.json({ success: true, host: clean, port, open: result.open, ms: result.ms });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}