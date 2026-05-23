export interface MyIpInput {
  _clientIp?: string;
}

export interface MyIpOutput {
  success: boolean;
  ip?: string;
  ipv6?: string;
  error?: string;
}

export async function process(params: unknown): Promise<MyIpOutput> {
  const { _clientIp } = (params ?? {}) as MyIpInput;

  // When called via API route the server injects the real client IP — return it directly
  if (_clientIp) {
    const isV6 = _clientIp.includes(":");
    return {
      success: true,
      ip: isV6 ? undefined : _clientIp,
      ipv6: isV6 ? _clientIp : undefined,
    };
  }

  // Browser / direct call — fetch from ipify
  try {
    const [v4res, v6res] = await Promise.allSettled([
      fetch("https://api4.ipify.org?format=json", { signal: AbortSignal.timeout(5000) }).then((r) => r.json()),
      fetch("https://api6.ipify.org?format=json", { signal: AbortSignal.timeout(5000) }).then((r) => r.json()),
    ]);
    const ip = v4res.status === "fulfilled" ? (v4res.value as { ip: string }).ip : undefined;
    const ipv6 = v6res.status === "fulfilled" ? (v6res.value as { ip: string }).ip : undefined;
    if (!ip && !ipv6) return { success: false, error: "Could not detect IP address" };
    return { success: true, ip, ipv6 };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
