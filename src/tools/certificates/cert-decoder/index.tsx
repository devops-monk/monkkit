"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ToolComponentProps } from "@/types/registry";
import type { CertDecoderOutput, CertField } from "./logic";

const SAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIDkzCCAnugAwIBAgIBATANBgkqhkiG9w0BAQsFADBbMRQwEgYDVQQDEwtleGFt
cGxlLmNvbTEhMB8GA1UEChMYSW50ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMQswCQYD
VQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTAeFw0yNDAxMDEwMDAwMDBaFw0y
NTAxMDEwMDAwMDBaMFsxFDASBgNVBAMTC2V4YW1wbGUuY29tMSEwHwYDVQQKExhJ
bnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpD
YWxpZm9ybmlhMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0I0H0N0l
WyWLO8I0fSTjHl2m3uvS4qwDqwQx8pwWl+wAquzNThhiQt1Sw0nvC5rr8bxu0jeZ
E+WBq6JIZIyTZ7BS/DWCPjgwsvooRsPhCN+qS1rjucG86SXDVZVdePdB2ykhGJLO
9Cjrg3wpdmW07+1OFPu6OwQeKqOBCzyckIUhAn4SKDDiJT8y4+VzKpmktcZG8tcX
I6yELcjriPqT5gZMp5mETomT99vbWV9vJg9LvuGzfAjnTgTKMsCYnPIJgF5qR2Ao
4Y6B30YANyRZ9io3cTKbOS2lNnWQsrgoz+Q13Wmyg44btt2udQ0A/ZSmdqTFp23P
A1ChcRPFH+dq4wIDAQABo2IwYDAJBgNVHRMEAjAAMAsGA1UdDwQEAwIFoDAdBgNV
HSUEFjAUBggrBgEFBQcDAQYIKwYBBQUHAwIwJwYDVR0RBCAwHoILZXhhbXBsZS5j
b22CD3d3dy5leGFtcGxlLmNvbTANBgkqhkiG9w0BAQsFAAOCAQEAvUgGsM92EgLr
9CDurIvPEfNR3+82ZDdke9ZXhZkQK2sJ9MdajFJmXdwdbi+Z8e/IraMWI2gxB+hl
02SaT5ZeYr0fv32TNuYjhvrM9IKUEwwaa92LVbaEo/Wgv3MLtMfr73sFXWjrCMuI
KlI9NiZ2hRkacKUbQj/QXlEkcQqn6JKg1YYsCCIJEy18OLdNE+FXOZOpiSLVR/xk
bySNWK4H9J7OGehEfZmroGyg2Odu/vUpHVGPFfwJ3v/uXwPjkJj87f6lzsk6tHNe
nDKdNIjLF+udOGZEuPWIQgBpeCNuhlCJ8Mys3fUi3+kgPNQgfeufd6iALVLon93L
pxFzWG4WLQ==
-----END CERTIFICATE-----`;

function DNSection({ title, fields }: { title: string; fields: CertField[] }) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
      <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1">
        {fields.map((f) => (
          <>
            <span key={`k-${f.name}`} className="text-xs text-muted-foreground py-0.5">{f.name}</span>
            <span key={`v-${f.name}`} className="text-xs font-mono break-all py-0.5">{f.value}</span>
          </>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <span className="text-xs text-muted-foreground py-0.5">{label}</span>
      <span className={`text-xs py-0.5 break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </>
  );
}

export default function CertDecoderTool({ toolMeta: _ }: ToolComponentProps) {
  const [pem, setPem] = useState("");
  const [result, setResult] = useState<CertDecoderOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const decode = async () => {
    setLoading(true);
    const { process } = await import("./logic");
    setResult(process({ pem }));
    setLoading(false);
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const OID_MAP: Record<string, string> = {
    "1.2.840.113549.1.1.11": "SHA-256 with RSA (sha256WithRSAEncryption)",
    "1.2.840.113549.1.1.5": "SHA-1 with RSA (sha1WithRSAEncryption)",
    "1.2.840.113549.1.1.12": "SHA-384 with RSA",
    "1.2.840.113549.1.1.13": "SHA-512 with RSA",
    "1.2.840.10045.4.3.2": "ECDSA with SHA-256",
    "1.2.840.10045.4.3.3": "ECDSA with SHA-384",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[600px]">
      {/* Input */}
      <div className="flex flex-col gap-3 lg:w-[380px] shrink-0">
        <Label className="text-sm font-medium">PEM Certificate</Label>
        <textarea
          value={pem}
          onChange={(e) => setPem(e.target.value)}
          placeholder="Paste your certificate here&#10;-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
          className="flex-1 min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <div className="flex gap-2">
          <Button onClick={decode} disabled={loading || !pem.trim()} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
            Decode Certificate
          </Button>
          <Button variant="outline" onClick={() => { setPem(SAMPLE_PEM); setResult(null); }}>
            Sample
          </Button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-auto">
        {result?.success ? (
          <div className="flex flex-col gap-4">
            {/* Status banner */}
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${result.expired ? "bg-red-500/10 border-red-500/20" : result.daysRemaining! < 30 ? "bg-orange-500/10 border-orange-500/20" : "bg-green-500/10 border-green-500/20"}`}>
              {result.expired
                ? <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                : <ShieldCheck className={`w-5 h-5 shrink-0 ${result.daysRemaining! < 30 ? "text-orange-400" : "text-green-500"}`} />}
              <div>
                <p className={`text-sm font-semibold ${result.expired ? "text-red-500" : result.daysRemaining! < 30 ? "text-orange-400" : "text-green-500"}`}>
                  {result.expired ? "Certificate Expired" : `Valid — ${result.daysRemaining} days remaining`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(result.notBefore!).toLocaleDateString()} → {new Date(result.notAfter!).toLocaleDateString()}
                </p>
              </div>
              {result.isCa && <span className="ml-auto text-xs bg-violet-600/20 text-violet-400 border border-violet-500/30 rounded px-2 py-0.5">CA Certificate</span>}
            </div>

            {/* Details grid */}
            <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
              {result.subject && <DNSection title="Subject" fields={result.subject} />}
              <div className="border-t border-border" />
              {result.issuer && <DNSection title="Issuer" fields={result.issuer} />}
              <div className="border-t border-border" />

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</p>
                <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1">
                  <Row label="Version" value={`v${result.version}`} />
                  <Row label="Serial" value={result.serial ?? ""} mono />
                  <Row label="Algorithm" value={OID_MAP[result.signatureAlgorithm ?? ""] ?? result.signatureAlgorithm ?? ""} />
                  {result.publicKeySize && <Row label="Key Size" value={`RSA ${result.publicKeySize}-bit`} />}
                </div>
              </div>

              {result.sans && result.sans.length > 0 && (
                <>
                  <div className="border-t border-border" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subject Alternative Names</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.sans.map((s) => (
                        <span key={s} className="text-xs font-mono bg-muted rounded px-2 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(result.keyUsage?.length || result.extKeyUsage?.length) ? (
                <>
                  <div className="border-t border-border" />
                  <div className="grid grid-cols-2 gap-4">
                    {result.keyUsage?.length ? (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Usage</p>
                        {result.keyUsage.map((u) => <p key={u} className="text-xs">{u}</p>)}
                      </div>
                    ) : null}
                    {result.extKeyUsage?.length ? (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Extended Key Usage</p>
                        {result.extKeyUsage.map((u) => <p key={u} className="text-xs">{u}</p>)}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}

              <div className="border-t border-border" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Fingerprints</p>
                <div className="flex flex-col gap-1.5">
                  {[{ label: "SHA-1", val: result.fingerprints?.sha1 }, { label: "SHA-256", val: result.fingerprints?.sha256 }].map(({ label, val }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-14 shrink-0">{label}</span>
                      <span className="text-xs font-mono flex-1 break-all">{val}</span>
                      <button onClick={() => copy(val!, label)} className="p-1 rounded hover:bg-muted shrink-0">
                        {copied === label ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : result && !result.success ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{result.error}</div>
        ) : (
          <div className="flex-1 h-full flex flex-col items-center justify-center text-center text-muted-foreground rounded-xl border-2 border-dashed border-border min-h-[300px]">
            <ShieldCheck className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Paste a PEM certificate and click Decode</p>
            <p className="text-xs mt-1">Supports X.509 v1/v2/v3 certificates</p>
          </div>
        )}
      </div>
    </div>
  );
}