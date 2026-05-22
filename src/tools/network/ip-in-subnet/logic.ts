export interface IpInSubnetInput {
  ip: string;
  subnet: string; // CIDR e.g. "192.168.1.0/24"
}

export interface IpInSubnetResult {
  inSubnet: boolean;
  ip: string;
  subnet: string;
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  cidr: number;
  totalHosts: number;
  ipBinary: string;
  networkBinary: string;
  broadcastBinary: string;
}

export interface IpInSubnetOutput {
  success: boolean;
  result?: IpInSubnetResult;
  error?: string;
}

function ipToNum(ip: string): number {
  return ip.split(".").reduce((acc, o) => (acc << 8) | parseInt(o, 10), 0) >>> 0;
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

function validateIp(ip: string): void {
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip))
    throw new Error(`Invalid IP address: ${ip}`);
  if (ip.split(".").map(Number).some((o) => o < 0 || o > 255))
    throw new Error(`IP octet out of range: ${ip}`);
}

export function process(params: unknown): IpInSubnetOutput {
  const { ip, subnet } = params as IpInSubnetInput;

  if (!ip?.trim()) return { success: false, error: "IP address is required" };
  if (!subnet?.trim()) return { success: false, error: "Subnet (CIDR) is required" };

  try {
    const ipTrimmed = ip.trim();
    const subnetTrimmed = subnet.trim();

    validateIp(ipTrimmed);

    if (!subnetTrimmed.includes("/"))
      throw new Error("Subnet must be in CIDR notation, e.g. 192.168.1.0/24");

    const [networkIp, cidrStr] = subnetTrimmed.split("/");
    const cidr = parseInt(cidrStr, 10);

    if (isNaN(cidr) || cidr < 0 || cidr > 32)
      throw new Error("CIDR prefix must be between 0 and 32");

    validateIp(networkIp.trim());

    const mask = cidrToMask(cidr);
    const networkNum = (ipToNum(networkIp.trim()) & mask) >>> 0;
    const broadcastNum = (networkNum | (~mask >>> 0)) >>> 0;
    const ipNum = ipToNum(ipTrimmed);

    const inSubnet = ipNum >= networkNum && ipNum <= broadcastNum;
    const totalHosts = Math.pow(2, 32 - cidr);

    return {
      success: true,
      result: {
        inSubnet,
        ip: ipTrimmed,
        subnet: subnetTrimmed,
        networkAddress: numToIp(networkNum),
        broadcastAddress: numToIp(broadcastNum),
        firstHost: cidr < 31 ? numToIp(networkNum + 1) : numToIp(networkNum),
        lastHost: cidr < 31 ? numToIp(broadcastNum - 1) : numToIp(broadcastNum),
        subnetMask: numToIp(mask),
        cidr,
        totalHosts,
        ipBinary: ipToBinary(ipTrimmed),
        networkBinary: ipToBinary(numToIp(networkNum)),
        broadcastBinary: ipToBinary(numToIp(broadcastNum)),
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
