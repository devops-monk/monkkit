"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Copy, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import type { ToolComponentProps } from "@/types/registry";
import type { PasswordInput, PasswordOutput } from "./logic";

const STRENGTH_META = {
  weak:   { label: "Weak",   color: "bg-red-500",    text: "text-red-500",    width: "w-1/4" },
  fair:   { label: "Fair",   color: "bg-orange-400",  text: "text-orange-400", width: "w-2/4" },
  good:   { label: "Good",   color: "bg-yellow-400",  text: "text-yellow-400", width: "w-3/4" },
  strong: { label: "Strong", color: "bg-green-500",   text: "text-green-500",  width: "w-full" },
};

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-violet-600" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default function PasswordTool({ toolMeta: _ }: ToolComponentProps) {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [customSymbols, setCustomSymbols] = useState("");
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<PasswordOutput | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = useCallback(async () => {
    const input: PasswordInput = { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, customSymbols, count };
    const { process } = await import("./logic");
    setResult(process(input));
  }, [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, customSymbols, count]);

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const copyAll = async () => {
    if (!result?.passwords.length) return;
    await navigator.clipboard.writeText(result.passwords.join("\n"));
    setCopiedIdx(-1);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const strength = result?.strength ? STRENGTH_META[result.strength] : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-[560px]">
      {/* Left: Config */}
      <div className="flex flex-col gap-5 lg:w-[360px] shrink-0">
        <div>
          <Label className="mb-2 block text-sm font-medium">Length: {length}</Label>
          <Slider min={4} max={128} step={1} value={[length]} onValueChange={(v) => setLength(Array.isArray(v) ? v[0] : v)} />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>4</span><span>128</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Character Sets</p>
          <Toggle label="Uppercase (A–Z)" checked={uppercase} onChange={setUppercase} />
          <Toggle label="Lowercase (a–z)" checked={lowercase} onChange={setLowercase} />
          <Toggle label="Numbers (0–9)" checked={numbers} onChange={setNumbers} />
          <Toggle label="Symbols (!@#…)" checked={symbols} onChange={setSymbols} />
        </div>

        {symbols && (
          <div>
            <Label className="mb-1.5 block text-sm">Custom Symbols (leave blank for default)</Label>
            <Input
              value={customSymbols}
              onChange={(e) => setCustomSymbols(e.target.value)}
              placeholder="!@#$%^&*"
              className="font-mono"
            />
          </div>
        )}

        <Toggle label="Exclude ambiguous characters (0, O, l, 1, I)" checked={excludeAmbiguous} onChange={setExcludeAmbiguous} />

        <div>
          <Label className="mb-2 block text-sm font-medium">Generate: {count} password{count !== 1 ? "s" : ""}</Label>
          <Slider min={1} max={20} step={1} value={[count]} onValueChange={(v) => setCount(Array.isArray(v) ? v[0] : v)} />
        </div>

        <Button onClick={generate} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <RefreshCw className="w-4 h-4" />
          Generate
        </Button>
      </div>

      {/* Right: Output */}
      <div className="flex-1 flex flex-col gap-4">
        {result?.success && result.passwords.length > 0 ? (
          <>
            {/* Strength bar */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className={`w-4 h-4 ${strength!.text}`} />
                  <span className={`text-sm font-semibold ${strength!.text}`}>{strength!.label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{result.entropy} bits of entropy</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength!.color} ${strength!.width}`} />
              </div>
            </div>

            {/* Password list */}
            <div className="flex flex-col gap-2 flex-1">
              {result.passwords.map((pw, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <span className="flex-1 font-mono text-sm break-all select-all">{pw}</span>
                  <button
                    onClick={() => copy(pw, i)}
                    className="shrink-0 p-1.5 rounded hover:bg-muted transition-colors"
                    title="Copy"
                  >
                    {copiedIdx === i
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <Copy className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={copyAll} className="gap-2 self-end">
              {copiedIdx === -1 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copiedIdx === -1 ? "Copied!" : "Copy All"}
            </Button>
          </>
        ) : result && !result.success ? (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {result.error}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground rounded-xl border-2 border-dashed border-border">
            <Shield className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm font-medium">Configure and click Generate</p>
            <p className="text-xs mt-1">Uses crypto.getRandomValues for secure randomness</p>
          </div>
        )}
      </div>
    </div>
  );
}