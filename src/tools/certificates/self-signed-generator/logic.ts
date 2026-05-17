import forge from "node-forge";

export interface SelfSignedInput {
  commonName: string;
  organization: string;
  orgUnit: string;
  country: string;
  state: string;
  locality: string;
  email: string;
  validityDays: number;
  keySize: 1024 | 2048 | 4096;
  sans: string;
}

export interface SelfSignedOutput {
  success: boolean;
  error?: string;
  certificate?: string;
  privateKey?: string;
  publicKey?: string;
}

export function process(input: SelfSignedInput): SelfSignedOutput {
  try {
    if (!input.commonName.trim()) return { success: false, error: "Common Name is required." };

    const keys = forge.pki.rsa.generateKeyPair({ bits: input.keySize, e: 0x10001 });
    const cert = forge.pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(16));
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + input.validityDays);

    const attrs: forge.pki.CertificateField[] = [
      { name: "commonName", value: input.commonName },
    ];
    if (input.organization) attrs.push({ name: "organizationName", value: input.organization });
    if (input.orgUnit) attrs.push({ name: "organizationalUnitName", value: input.orgUnit });
    if (input.country) attrs.push({ shortName: "C", value: input.country });
    if (input.state) attrs.push({ name: "stateOrProvinceName", value: input.state });
    if (input.locality) attrs.push({ name: "localityName", value: input.locality });
    if (input.email) attrs.push({ name: "emailAddress", value: input.email });

    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    const extensions: object[] = [
      { name: "basicConstraints", cA: false },
      { name: "keyUsage", digitalSignature: true, keyEncipherment: true, dataEncipherment: true },
      { name: "extKeyUsage", serverAuth: true, clientAuth: true },
      { name: "subjectKeyIdentifier" },
    ];

    const sanList = input.sans.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (sanList.length > 0) {
      extensions.push({
        name: "subjectAltName",
        altNames: sanList.map((s) => {
          if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return { type: 7, ip: s };
          return { type: 2, value: s };
        }),
      });
    }

    cert.setExtensions(extensions);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    return {
      success: true,
      certificate: forge.pki.certificateToPem(cert),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    };
  } catch (e) {
    return { success: false, error: `Generation failed: ${(e as Error).message}` };
  }
}