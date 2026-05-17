"use client";

import { useState } from "react";
import { FileKey, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ToolComponentProps } from "@/types/registry";
import type { CsrDecoderOutput } from "./logic";

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <>
      <span className="text-xs text-muted-foreground py-0.5 shrink-0">{label}</span>
      <span className={`text-xs py-0.5 break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </>
  );
}

export default function CsrDecoderTool({ toolMeta: _ }: ToolComponentProps) {
  const [pem, setPem] = useState("");
  const [result, setResult] = useState<CsrDecoderOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const decode = async () => {
    setLoading(true);
    const { process } = await import("./logic");
    setResult(process({ pem }));
    setLoading(false);
  };

  const DN_ORDER = ["Common Name", "Organization", "Org Unit", "Country", "State", "Locality", "Email"];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[540px]">
      <div className="flex flex-col gap-3 lg:w-[380px] shrink-0">
        <Label className="text-sm font-medium">PEM Certificate Signing Request</Label>
        <textarea
          value={pem}
          onChange={(e) => setPem(e.target.value)}
          placeholder="-----BEGIN CERTIFICATE REQUEST-----&#10;...&#10;-----END CERTIFICATE REQUEST-----"
          className="flex-1 min-h-[280px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <Button onClick={decode} disabled={loading || !pem.trim()} className="bg-violet-600 hover:bg-violet-700 text-white">
          Decode CSR
        </Button>
      </div>

      <div className="flex-1">
        {result?.success ? (
          <div className="flex flex-col gap-4">
            {/* Signature verification badge */}
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-sm ${result.verified ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {result.verified
                ? <><CheckCircle className="w-4 h-4" /> Signature verified — CSR is self-consistent</>
                : <><XCircle className="w-4 h-4" /> Signature verification failed</>}
            </div>

            <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Subject</p>
                <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1">
                  {DN_ORDER.map((name) => {
                    const f = result.subject?.find((s) => s.name === name);
                    return f ? <Row key={name} label={f.name} value={f.value} /> : null;
                  })}
                </div>
              </div>

              <div className="border-t border-border" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key &amp; Algorithm</p>
                <div className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1">
                  <Row label="Algorithm" value={result.publicKeyAlgorithm ?? ""} />
                  {result.publicKeySize && <Row label="Key Size" value={`${result.publicKeySize} bits`} />}
                  <Row label="Signature Algo" value={result.signatureAlgorithm ?? ""} />
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
            </div>
          </div>
        ) : result && !result.success ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{result.error}</div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground rounded-xl border-2 border-dashed border-border min-h-[300px]">
            <FileKey className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Paste a PEM CSR and click Decode</p>
            <p className="text-xs mt-1">Verifies signature and extracts all fields</p>
          </div>
        )}
      </div>
    </div>
  );
}