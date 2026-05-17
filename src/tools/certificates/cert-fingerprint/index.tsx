"use client";

import { useState } from "react";
import { Fingerprint, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ToolComponentProps } from "@/types/registry";
import type { FingerprintOutput } from "./logic";

export default function CertFingerprintTool({ toolMeta: _ }: ToolComponentProps) {
  const [pem, setPem] = useState("");
  const [result, setResult] = useState<FingerprintOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const compute = async () => {
    setLoading(true);
    const { process } = await import("./logic");
    setResult(await process({ pem }));
    setLoading(false);
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const fingerprints = result?.success
    ? [
        { label: "SHA-1", value: result.sha1!, desc: "40 hex chars — legacy, avoid for new systems" },
        { label: "SHA-256", value: result.sha256!, desc: "64 hex chars — recommended" },
        { label: "SHA-512", value: result.sha512!, desc: "128 hex chars — maximum strength" },
      ]
    : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[500px]">
      <div className="flex flex-col gap-3 lg:w-[380px] shrink-0">
        <Label className="text-sm font-medium">PEM Certificate</Label>
        <textarea
          value={pem}
          onChange={(e) => setPem(e.target.value)}
          placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
          className="flex-1 min-h-[260px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <Button onClick={compute} disabled={loading || !pem.trim()} className="bg-violet-600 hover:bg-violet-700 text-white">
          Compute Fingerprints
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {fingerprints.length > 0 ? (
          fingerprints.map(({ label, value, desc }) => (
            <div key={label} className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold">{label}</span>
                <button onClick={() => copy(value, label)} className="p-1.5 rounded hover:bg-muted">
                  {copied === label ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{desc}</p>
              <p className="text-xs font-mono break-all select-all bg-background rounded px-2 py-1.5 border border-border">{value}</p>
            </div>
          ))
        ) : result && !result.success ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{result.error}</div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground rounded-xl border-2 border-dashed border-border min-h-[300px]">
            <Fingerprint className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Paste a certificate to compute fingerprints</p>
            <p className="text-xs mt-1">SHA-1, SHA-256, and SHA-512 — computed locally in your browser</p>
          </div>
        )}
      </div>
    </div>
  );
}