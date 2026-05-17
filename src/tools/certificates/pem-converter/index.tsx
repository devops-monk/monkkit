"use client";

import { useState } from "react";
import { ArrowLeftRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ToolComponentProps } from "@/types/registry";
import type { ConvertMode, PemType, PemConverterOutput } from "./logic";

const MODES: { value: ConvertMode; label: string }[] = [
  { value: "pem-to-der", label: "PEM → DER (hex bytes)" },
  { value: "der-to-pem", label: "DER (hex) → PEM" },
  { value: "pem-to-base64", label: "PEM → Base64 (strip headers)" },
  { value: "base64-to-pem", label: "Base64 → PEM (add headers)" },
];

const PEM_TYPES: { value: PemType; label: string }[] = [
  { value: "CERTIFICATE", label: "CERTIFICATE" },
  { value: "CERTIFICATE REQUEST", label: "CERTIFICATE REQUEST" },
  { value: "PRIVATE KEY", label: "PRIVATE KEY" },
  { value: "RSA PRIVATE KEY", label: "RSA PRIVATE KEY" },
  { value: "PUBLIC KEY", label: "PUBLIC KEY" },
];

export default function PemConverterTool({ toolMeta: _ }: ToolComponentProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<ConvertMode>("pem-to-der");
  const [pemType, setPemType] = useState<PemType>("CERTIFICATE");
  const [result, setResult] = useState<PemConverterOutput | null>(null);
  const [copied, setCopied] = useState(false);

  const needsPemType = mode === "der-to-pem" || mode === "base64-to-pem";
  const inputLabel = mode === "pem-to-der" || mode === "pem-to-base64" ? "PEM Input" : mode === "der-to-pem" ? "DER Hex Input" : "Base64 Input";
  const outputLabel = mode === "pem-to-der" ? "DER Hex Output" : mode === "der-to-pem" || mode === "base64-to-pem" ? "PEM Output" : "Base64 Output";

  const convert = async () => {
    const { process } = await import("./logic");
    setResult(process({ input, mode, pemType }));
  };

  const copy = async () => {
    if (!result?.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <Label className="mb-1.5 block text-sm">Conversion</Label>
          <Select value={mode} onValueChange={(v) => { setMode(v as ConvertMode); setResult(null); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {needsPemType && (
          <div className="min-w-[180px]">
            <Label className="mb-1.5 block text-sm">PEM Type</Label>
            <Select value={pemType} onValueChange={(v) => setPemType(v as PemType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PEM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button onClick={convert} disabled={!input.trim()} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <ArrowLeftRight className="w-4 h-4" /> Convert
        </Button>
      </div>

      {/* IO panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs text-muted-foreground">{inputLabel}</Label>
          <textarea
            value={input}
            onChange={(e) => { setInput(e.target.value); setResult(null); }}
            className="h-64 w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Paste input here..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">{outputLabel}</Label>
            {result?.success && (
              <div className="flex items-center gap-2">
                {result.bytes && <span className="text-xs text-muted-foreground">{result.bytes} bytes</span>}
                <button onClick={copy} className="p-1 rounded hover:bg-muted">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
              </div>
            )}
          </div>
          <textarea
            readOnly
            value={result?.success ? result.output ?? "" : result?.error ?? ""}
            className={`h-64 w-full rounded-md border px-3 py-2 text-xs font-mono resize-none bg-muted/30 ${result && !result.success ? "border-red-500/40 text-red-400" : "border-input"}`}
            placeholder="Output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}