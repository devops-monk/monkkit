export interface IpParserInput {
  input: string;
}

export interface IpInfo {
  address: string;
  version: 4 | 6;
  octets?: number[];
  hex?: string;
  binary?: string;
  decimal?: number;
  type: string;
  isPrivate?: boolean;
  isLoopback?: boolean;
  isMulticast?: boolean;
  cidr?: string;
}

export interface IpParserOutput {
  success: boolean;
  info?: IpInfo;
  error?: string;
}

function parseIPv4(ip: string): IpParserOutput {
  const parts = ip.split(".");
  if (parts.length !== 4) return { success: false, error: "Invalid IPv4 address" };
  const octets = parts.map(Number);
  if (octets.some((o) => isNaN(o) || o < 0 || o > 255)) return { success: false, error: "Invalid IPv4 octet value" };
  const decimal = octets.reduce((acc, o) => (acc << 8) | o, 0) >>> 0;
  const hex = octets.map((o) => o.toString(16).padStart(2, "0")).join(":");
  const binary = octets.map((o) => o.toString(2).padStart(8, "0")).join(".");
  const [a, b] = octets;
  let type = "Public";
  let isPrivate = false;
  let isLoopback = false;
  let isMulticast = false;
  if (a === 10) { type = "Private (Class A)"; isPrivate = true; }
  else if (a === 172 && b >= 16 && b <= 31) { type = "Private (Class B)"; isPrivate = true; }
  else if (a === 192 && b === 168) { type = "Private (Class C)"; isPrivate = true; }
  else if (a === 127) { type = "Loopback"; isLoopback = true; }
  else if (a >= 224 && a <= 239) { type = "Multicast"; isMulticast = true; }
  else if (a === 169 && b === 254) { type = "Link-Local"; }
  else if (a === 0) { type = "This Network"; }
  else if (a === 255) { type = "Broadcast"; }
  return { success: true, info: { address: ip, version: 4, octets, hex, binary, decimal, type, isPrivate, isLoopback, isMulticast } };
}

function parseIPv6(ip: string): IpParserOutput {
  let expanded = ip;
  if (ip.includes("::")) {
    const sides = ip.split("::");
    const left = sides[0] ? sides[0].split(":") : [];
    const right = sides[1] ? sides[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    expanded = [...left, ...Array(missing).fill("0000"), ...right].join(":");
  }
  const groups = expanded.split(":");
  if (groups.length !== 8) return { success: false, error: "Invalid IPv6 address" };
  const fullGroups = groups.map((g) => g.padStart(4, "0"));
  let type = "Global Unicast";
  const first = parseInt(fullGroups[0], 16);
  if (ip === "::1") type = "Loopback";
  else if (ip === "::") type = "Unspecified";
  else if ((first & 0xff00) === 0xfe80) type = "Link-Local";
  else if ((first & 0xff00) === 0xff00) type = "Multicast";
  else if ((first & 0xfe00) === 0xfc00) type = "Unique Local";
  return {
    success: true,
    info: {
      address: ip,
      version: 6,
      hex: fullGroups.join(":"),
      type,
      isLoopback: ip === "::1",
      isMulticast: (first & 0xff00) === 0xff00,
    }
  };
}

export function process(params: unknown): IpParserOutput {
  const { input } = params as IpParserInput;
  const trimmed = input?.trim();
  if (!trimmed) return { success: false, error: "Input is empty" };
  if (trimmed.includes(":") && !trimmed.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return parseIPv6(trimmed);
  }
  return parseIPv4(trimmed);
}
