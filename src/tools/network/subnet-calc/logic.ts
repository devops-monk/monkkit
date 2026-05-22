export interface SubnetInput {
  input: string; // "192.168.1.0/24" or "192.168.1.0 255.255.255.0"
}

export interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  wildcardMask: string;
  cidr: number;
  totalHosts: number;
  usableHosts: number;
  ipClass: string;
  binaryMask: string;
  binaryNetwork: string;
}

export interface SubnetOutput {
  success: boolean;
  info?: SubnetInfo;
  error?: string;
}

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0;
}

function numToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

function cidrToMask(cidr: number): number {
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
}

function ipToBinary(ip: string): string {
  return ip.split(".").map((o) => parseInt(o, 10).toString(2).padStart(8, "0")).join(".");
}

export function process(params: unknown): SubnetOutput {
  const { input } = params as SubnetInput;
  const trimmed = input?.trim();
  if (!trimmed) return { success: false, error: "Input is required" };
  try {
    let ip: string, cidr: number;

    if (trimmed.includes("/")) {
      const [ipPart, cidrPart] = trimmed.split("/");
      ip = ipPart.trim();
      cidr = parseInt(cidrPart.trim(), 10);
      if (isNaN(cidr) || cidr < 0 || cidr > 32) throw new Error("CIDR must be 0–32");
    } else if (trimmed.includes(" ")) {
      const parts = trimmed.split(/\s+/);
      ip = parts[0];
      const maskNum = ipToNum(parts[1]);
      cidr = (maskNum >>> 0).toString(2).replace(/0+$/, "").length;
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(parts[1])) throw new Error("Invalid subnet mask");
    } else {
      throw new Error("Provide CIDR notation (e.g. 192.168.1.0/24) or IP + mask");
    }

    if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) throw new Error("Invalid IP address");
    const octets = ip.split(".").map(Number);
    if (octets.some((o) => o < 0 || o > 255)) throw new Error("Invalid IP octet");

    const mask = cidrToMask(cidr);
    const ipNum = ipToNum(ip);
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const totalHosts = Math.pow(2, 32 - cidr);
    const usable = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

    const firstOctet = (network >>> 24) & 0xff;
    let ipClass = "E";
    if (firstOctet < 128) ipClass = "A";
    else if (firstOctet < 192) ipClass = "B";
    else if (firstOctet < 224) ipClass = "C";
    else if (firstOctet < 240) ipClass = "D (Multicast)";

    return {
      success: true,
      info: {
        networkAddress: numToIp(network),
        broadcastAddress: numToIp(broadcast),
        firstHost: cidr < 31 ? numToIp(network + 1) : numToIp(network),
        lastHost: cidr < 31 ? numToIp(broadcast - 1) : numToIp(broadcast),
        subnetMask: numToIp(mask),
        wildcardMask: numToIp(~mask >>> 0),
        cidr,
        totalHosts,
        usableHosts: usable,
        ipClass,
        binaryMask: ipToBinary(numToIp(mask)),
        binaryNetwork: ipToBinary(numToIp(network)),
      }
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
