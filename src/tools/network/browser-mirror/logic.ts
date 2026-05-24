export interface BrowserMirrorOutput {
  success: boolean;
  data?: Record<string, string | number | boolean | null>;
  error?: string;
}

export async function process(_params: unknown): Promise<BrowserMirrorOutput> {
  if (typeof window === "undefined") {
    return { success: false, error: "Browser-only tool" };
  }

  const nav = navigator;
  const scr = screen;

  let publicIp = "";
  try {
    const res = await fetch("https://api4.ipify.org?format=json", { signal: AbortSignal.timeout(4000) });
    const json = await res.json();
    publicIp = json.ip ?? "";
  } catch { /* ignore */ }

  const connection = (nav as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number } }).connection;

  return {
    success: true,
    data: {
      "Public IP": publicIp || "Unknown",
      "User Agent": nav.userAgent,
      "Platform": nav.platform,
      "Language": nav.language,
      "Languages": nav.languages?.join(", ") ?? nav.language,
      "Screen Resolution": `${scr.width} × ${scr.height}`,
      "Viewport": `${window.innerWidth} × ${window.innerHeight}`,
      "Color Depth": scr.colorDepth,
      "Pixel Ratio": window.devicePixelRatio,
      "Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
      "UTC Offset (min)": -new Date().getTimezoneOffset(),
      "Cookies Enabled": nav.cookieEnabled,
      "Do Not Track": nav.doNotTrack === "1" ? true : nav.doNotTrack === "0" ? false : null,
      "CPU Cores": nav.hardwareConcurrency ?? null,
      "Memory (GB)": (nav as unknown as { deviceMemory?: number }).deviceMemory ?? null,
      "Touch Points": nav.maxTouchPoints ?? 0,
      "Connection Type": connection?.effectiveType ?? null,
      "Downlink (Mbps)": connection?.downlink ?? null,
      "RTT (ms)": connection?.rtt ?? null,
      "Online": nav.onLine,
      "Java Enabled": false,
    },
  };
}
