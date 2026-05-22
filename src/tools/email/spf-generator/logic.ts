export interface SpfGeneratorInput {
  policy: "~all" | "-all" | "?all" | "+all";
  includeDomains: string;
  allowedIps4: string;
  allowedIps6: string;
  includeA: boolean;
  includeMx: boolean;
}

export interface SpfGeneratorOutput {
  success: boolean;
  record?: string;
  error?: string;
}

export function process(params: unknown): SpfGeneratorOutput {
  const {
    policy = "~all",
    includeDomains = "",
    allowedIps4 = "",
    allowedIps6 = "",
    includeA = false,
    includeMx = true,
  } = params as SpfGeneratorInput;

  const parts = ["v=spf1"];
  if (includeMx) parts.push("mx");
  if (includeA) parts.push("a");
  allowedIps4.split(/[\n,\s]+/).filter(Boolean).forEach((ip) => parts.push(`ip4:${ip.trim()}`));
  allowedIps6.split(/[\n,\s]+/).filter(Boolean).forEach((ip) => parts.push(`ip6:${ip.trim()}`));
  includeDomains.split(/[\n,\s]+/).filter(Boolean).forEach((d) => parts.push(`include:${d.trim()}`));
  parts.push(policy);

  return { success: true, record: parts.join(" ") };
}
