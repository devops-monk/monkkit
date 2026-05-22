export interface DmarcGeneratorInput {
  policy: "none" | "quarantine" | "reject";
  subdomainPolicy?: "none" | "quarantine" | "reject";
  pct?: number;
  rua?: string;
  ruf?: string;
  aspf?: "r" | "s";
  adkim?: "r" | "s";
  fo?: string;
}

export interface DmarcGeneratorOutput {
  success: boolean;
  record?: string;
  error?: string;
}

export function process(params: unknown): DmarcGeneratorOutput {
  const {
    policy = "none",
    subdomainPolicy,
    pct = 100,
    rua = "",
    ruf = "",
    aspf = "r",
    adkim = "r",
    fo,
  } = params as DmarcGeneratorInput;

  const parts = ["v=DMARC1", `p=${policy}`];
  if (subdomainPolicy && subdomainPolicy !== policy) parts.push(`sp=${subdomainPolicy}`);
  if (aspf !== "r") parts.push(`aspf=${aspf}`);
  if (adkim !== "r") parts.push(`adkim=${adkim}`);
  if (pct !== 100) parts.push(`pct=${pct}`);
  if (rua?.trim()) parts.push(`rua=${rua.trim().split(/[\n,]+/).map((u) => u.trim()).join(",")}`);
  if (ruf?.trim()) parts.push(`ruf=${ruf.trim().split(/[\n,]+/).map((u) => u.trim()).join(",")}`);
  if (fo) parts.push(`fo=${fo}`);

  const record = parts.join("; ");
  return { success: true, record };
}
