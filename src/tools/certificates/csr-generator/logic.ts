import forge from "node-forge";

export interface CsrGeneratorInput {
  commonName: string;
  organization: string;
  orgUnit: string;
  country: string;
  state: string;
  locality: string;
  email: string;
  keySize: 1024 | 2048 | 4096;
  sans: string;
}

export interface CsrGeneratorOutput {
  success: boolean;
  error?: string;
  csr?: string;
  privateKey?: string;
  publicKey?: string;
}

export function process(input: CsrGeneratorInput): CsrGeneratorOutput {
  try {
    if (!input.commonName.trim()) return { success: false, error: "Common Name is required." };

    const keys = forge.pki.rsa.generateKeyPair({ bits: input.keySize, e: 0x10001 });
    const csr = forge.pki.createCertificationRequest();

    csr.publicKey = keys.publicKey;

    const attrs: forge.pki.CertificateField[] = [
      { name: "commonName", value: input.commonName },
    ];
    if (input.organization) attrs.push({ name: "organizationName", value: input.organization });
    if (input.orgUnit) attrs.push({ name: "organizationalUnitName", value: input.orgUnit });
    if (input.country) attrs.push({ shortName: "C", value: input.country });
    if (input.state) attrs.push({ name: "stateOrProvinceName", value: input.state });
    if (input.locality) attrs.push({ name: "localityName", value: input.locality });
    if (input.email) attrs.push({ name: "emailAddress", value: input.email });

    csr.setSubject(attrs);

    const sanList = input.sans.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (sanList.length > 0) {
      csr.setAttributes([{
        name: "extensionRequest",
        extensions: [{
          name: "subjectAltName",
          altNames: sanList.map((s) => {
            if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) return { type: 7, ip: s };
            return { type: 2, value: s };
          }),
        }],
      }]);
    }

    csr.sign(keys.privateKey, forge.md.sha256.create());

    return {
      success: true,
      csr: forge.pki.certificationRequestToPem(csr),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    };
  } catch (e) {
    return { success: false, error: `CSR generation failed: ${(e as Error).message}` };
  }
}