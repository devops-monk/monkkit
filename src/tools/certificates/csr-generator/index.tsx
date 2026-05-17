"use client";

import { useState } from "react";
import { FileKey, Download, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ToolComponentProps } from "@/types/registry";
import type { CsrGeneratorInput, CsrGeneratorOutput } from "./logic";

function PemBlock({ label, value, filename }: { label: string; value: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([value], { type: "text/plain" }));
    a.download = filename; a.click();
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
        <div className="flex gap-1">
          <button onClick={copy} className="p-1.5 rounded hover:bg-muted">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <button onClick={download} className="p-1.5 rounded hover:bg-muted"><Download className="w-3.5 h-3.5 text-muted-foreground" /></button>
        </div>
      </div>
      <textarea readOnly value={value} className="h-44 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-xs font-mono resize-none select-all" />
    </div>
  );
}

export default function CsrGeneratorTool({ toolMeta: _ }: ToolComponentProps) {
  const [cn, setCn] = useState("");
  const [org, setOrg] = useState("");
  const [ou, setOu] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [email, setEmail] = useState("");
  const [keySize, setKeySize] = useState<1024 | 2048 | 4096>(2048);
  const [sans, setSans] = useState("");
  const [result, setResult] = useState<CsrGeneratorOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const input: CsrGeneratorInput = { commonName: cn, organization: org, orgUnit: ou, country, state, locality, email, keySize, sans };
    const { process } = await import("./logic");
    setResult(process(input));
    setLoading(false);
  };

  const fields = [
    { label: "Common Name *", val: cn, set: setCn, ph: "example.com", col: 2 },
    { label: "Organization", val: org, set: setOrg, ph: "Acme Inc.", col: 1 },
    { label: "Org Unit", val: ou, set: setOu, ph: "IT", col: 1 },
    { label: "Country (2-letter)", val: country, set: setCountry, ph: "US", col: 1 },
    { label: "State", val: state, set: setState, ph: "California", col: 1 },
    { label: "Locality", val: locality, set: setLocality, ph: "San Francisco", col: 1 },
    { label: "Email", val: email, set: setEmail, ph: "admin@example.com", col: 1 },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="flex flex-col gap-4 lg:w-[380px] shrink-0">
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ label, val, set, ph, col }) => (
            <div key={label} className={col === 2 ? "col-span-2" : ""}>
              <Label className="mb-1 block text-xs">{label}</Label>
              <Input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="text-sm" />
            </div>
          ))}
        </div>

        <div>
          <Label className="mb-1.5 block text-xs">Subject Alternative Names (optional, one per line)</Label>
          <textarea
            value={sans}
            onChange={(e) => setSans(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono h-20 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="www.example.com&#10;example.com&#10;192.168.1.1"
          />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs">Key Size</Label>
          <Select value={String(keySize)} onValueChange={(v) => setKeySize(Number(v) as 1024 | 2048 | 4096)}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2048">2048-bit (recommended)</SelectItem>
              <SelectItem value="4096">4096-bit (strong)</SelectItem>
              <SelectItem value="1024">1024-bit (legacy)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generate} disabled={loading || !cn.trim()} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileKey className="w-4 h-4" />}
          {loading ? `Generating (${keySize}-bit)…` : "Generate CSR + Key"}
        </Button>

        <p className="text-xs text-muted-foreground">Keys are generated locally. Submit the CSR to a CA to get a signed certificate.</p>
      </div>

      <div className="flex-1">
        {result?.success ? (
          <Tabs defaultValue="csr">
            <TabsList className="mb-4">
              <TabsTrigger value="csr">CSR</TabsTrigger>
              <TabsTrigger value="key">Private Key</TabsTrigger>
              <TabsTrigger value="pub">Public Key</TabsTrigger>
            </TabsList>
            <TabsContent value="csr">
              <PemBlock label="Certificate Signing Request (PEM)" value={result.csr!} filename="request.csr" />
              <p className="text-xs text-muted-foreground mt-2">Submit this CSR to your Certificate Authority (Let&apos;s Encrypt, DigiCert, etc.)</p>
            </TabsContent>
            <TabsContent value="key">
              <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-400 mb-3">
                Save your private key securely. You&apos;ll need it when installing the signed certificate.
              </div>
              <PemBlock label="Private Key (PEM)" value={result.privateKey!} filename="private.key" />
            </TabsContent>
            <TabsContent value="pub">
              <PemBlock label="Public Key (PEM)" value={result.publicKey!} filename="public.key" />
            </TabsContent>
          </Tabs>
        ) : result && !result.success ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{result.error}</div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground rounded-xl border-2 border-dashed border-border min-h-[300px]">
            <FileKey className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Fill in your details and click Generate</p>
            <p className="text-xs mt-1">Creates a CSR and private key — submit the CSR to your CA</p>
          </div>
        )}
      </div>
    </div>
  );
}