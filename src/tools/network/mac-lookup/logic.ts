export interface MacInput {
  input: string;
  outputFormat?: "colon" | "hyphen" | "dot" | "plain";
}

export interface MacOutput {
  success: boolean;
  formatted?: Record<string, string>;
  oui?: string;
  error?: string;
}

export function process(params: unknown): MacOutput {
  const { input } = params as MacInput;
  const trimmed = input?.trim().replace(/[:\-.\s]/g, "").toUpperCase();
  if (!trimmed) return { success: false, error: "Input is empty" };
  if (!/^[0-9A-F]{12}$/.test(trimmed)) return { success: false, error: "Invalid MAC address — must be 12 hex digits" };
  const pairs = trimmed.match(/.{2}/g)!;
  const formatted = {
    "Colon (AA:BB:CC:DD:EE:FF)": pairs.join(":"),
    "Hyphen (AA-BB-CC-DD-EE-FF)": pairs.join("-"),
    "Dot (AABB.CCDD.EEFF)": [pairs.slice(0, 2).join(""), pairs.slice(2, 4).join(""), pairs.slice(4).join("")].join("."),
    "Plain (AABBCCDDEEFF)": trimmed,
    "Cisco IOS": [pairs.slice(0, 2).join(""), pairs.slice(2, 4).join(""), pairs.slice(4).join("")].join(".").toLowerCase(),
  };
  const oui = pairs.slice(0, 3).join(":");
  const bits = parseInt(pairs[0], 16);
  const multicast = (bits & 1) === 1;
  const localAdmin = (bits & 2) === 2;
  return { success: true, formatted, oui, error: undefined };
}
