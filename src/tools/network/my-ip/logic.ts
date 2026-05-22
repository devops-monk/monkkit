export interface MyIpOutput {
  success: boolean;
  ip?: string;
  ipv6?: string;
  error?: string;
}

export async function process(_params: unknown): Promise<MyIpOutput> {
  try {
    const [v4res, v6res] = await Promise.allSettled([
      fetch("https://api4.ipify.org?format=json", { signal: AbortSignal.timeout(5000) }).then((r) => r.json()),
      fetch("https://api6.ipify.org?format=json", { signal: AbortSignal.timeout(5000) }).then((r) => r.json()),
    ]);
    const ip = v4res.status === "fulfilled" ? v4res.value.ip : undefined;
    const ipv6 = v6res.status === "fulfilled" ? v6res.value.ip : undefined;
    if (!ip && !ipv6) return { success: false, error: "Could not detect IP address" };
    return { success: true, ip, ipv6 };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
