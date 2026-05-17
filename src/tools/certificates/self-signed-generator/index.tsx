"use client";

import { useState } from "react";
import { ShieldPlus, Download, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ToolComponentProps } from "@/types/registry";
import type { SelfSignedOutput, SelfSignedInput } from "./logic";

const KEY_SIZES = [
  { value: 2048, label: "2048-bit (recommended)" },
  { value: 4096, label: "4096-bit (strong)" },
  { value: 1024, label: "1024-bit (legacy, weak)" },
];

function PemBlock({ label, value, filename }: { label: string; value: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
        <div className="flex gap-1">
          <button onClick={copy} className="p-1.5 rounded hover:bg-muted" title="Copy">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
          <button onClick={download} className="p-1.5 rounded hover:bg-muted" title="Download">
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      <textarea readOnly value={value} className="h-40 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-xs font-mono resize-none select-all" />
    </div>
  );
}

export default function SelfSignedGeneratorTool({ toolMeta: _ }: ToolComponentProps) {
  const [cn, setCn] = useState("localhost");
  const [org, setOrg] = useState("");
  const [ou, setOu] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [email, setEmail] = useState("");
  const [validityDays, setValidityDays] = useState(365);
  const [keySize, setKeySize] = useState<1024 | 2048 | 4096>(2048);
  const [sans, setSans] = useState("localhost\n127.0.0.1");
  const [result, setResult] = useState<SelfSignedOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const input: SelfSignedInput = { commonName: cn, organization: org, orgUnit: ou, country, state, locality, email, validityDays, keySize, sans };
    const { process } = await import("./logic");
    setResult(process(input));
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* Form */}
      <div className="flex flex-col gap-4 lg:w-[380px] shrink-0">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Common Name *", val: cn, set: setCn, ph: "localhost", col: 2 },
            { label: "Organization", val: org, set: setOrg, ph: "Acme Inc.", col: 1 },
            { label: "Org Unit", val: ou, set: setOu, ph: "Engineering", col: 1 },
            { label: "Country (2-letter)", val: country, set: setCountry, ph: "US", col: 1 },
            { label: "State", val: state, set: setState, ph: "California", col: 1 },
            { label: "Locality", val: locality, set: setLocality, ph: "San Francisco", col: 1 },
            { label: "Email", val: email, set: setEmail, ph: "admin@example.com", col: 1 },
          ].map(({ label, val, set, ph, col }) => (
            <div key={label} className={col === 2 ? "col-span-2" : ""}>
              <Label className="mb-1 block text-xs">{label}</Label>
              <Input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} className="text-sm" />
            </div>
          ))}
        </div>

        <div>
          <Label className="mb-1.5 block text-xs">Subject Alternative Names (one per line or comma-separated)</Label>
          <textarea
            value={sans}
            onChange={(e) => setSans(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono h-20 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="localhost&#10;127.0.0.1&#10;example.com"
          />
        </div>

        <div>
          <Label className="mb-1.5 block text-xs">Key Size</Label>
          <Select value={String(keySize)} onValueChange={(v) => setKeySize(Number(v) as 1024 | 2048 | 4096)}>
            <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{KEY_SIZES.map((k) => <SelectItem key={k.value} value={String(k.value)}>{k.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1.5 block text-xs">Validity: {validityDays} days ({Math.round(validityDays / 365 * 10) / 10} year{validityDays !== 365 ? "s" : ""})</Label>
          <Slider min={1} max={3650} step={1} value={[validityDays]} onValueChange={(v) => setValidityDays(Array.isArray(v) ? v[0] : v)} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>1 day</span><span>10 years</span></div>
        </div>

        <Button onClick={generate} disabled={loading || !cn.trim()} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldPlus className="w-4 h-4" />}
          {loading ? `Generating (${keySize}-bit takes a moment)…` : "Generate Certificate"}
        </Button>

        <p className="text-xs text-muted-foreground">All generation happens locally in your browser. Private keys never leave your device.</p>
      </div>

      {/* Output */}
      <div className="flex-1">
        {result?.success ? (
          <Tabs defaultValue="cert">
            <TabsList className="mb-4">
              <TabsTrigger value="cert">Certificate</TabsTrigger>
              <TabsTrigger value="key">Private Key</TabsTrigger>
              <TabsTrigger value="pub">Public Key</TabsTrigger>
            </TabsList>
            <TabsContent value="cert">
              <PemBlock label="Certificate (PEM)" value={result.certificate!} filename="certificate.pem" />
            </TabsContent>
            <TabsContent value="key">
              <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-400 mb-3">
                Keep your private key secure. Never share it or commit it to version control.
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
            <ShieldPlus className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Fill in the details and click Generate</p>
            <p className="text-xs mt-1">Creates a self-signed X.509 certificate with key pair</p>
          </div>
        )}
      </div>
    </div>
  );
}