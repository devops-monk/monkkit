"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Binary, Copy, Check, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

export default function ImageToBase64Tool({ toolMeta: _ }: ToolComponentProps) {
  const [mode, setMode] = useState<"image-to-base64" | "base64-to-image">("image-to-base64");
  const [file, setFile] = useState<File | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [rawBase64, setRawBase64] = useState<string | null>(null);
  const [b64Input, setB64Input] = useState("");
  const [b64Preview, setB64Preview] = useState<string | null>(null);
  const [b64Error, setB64Error] = useState<string | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setError(null);
    setDataUri(null);
    setRawBase64(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDataUri(result);
      setRawBase64(result.split(",")[1] ?? "");
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsDataURL(f);
  }, []);

  const handleB64Decode = () => {
    setB64Error(null);
    setB64Preview(null);
    try {
      const stripped = b64Input.trim().replace(/^data:[^;]+;base64,/, "");
      // Validate
      atob(stripped);
      const mimeMatch = b64Input.match(/^data:([^;]+);base64,/);
      const mime = mimeMatch ? mimeMatch[1] : "image/png";
      setB64Preview(`data:${mime};base64,${stripped}`);
    } catch {
      setB64Error("Invalid base64 string");
    }
  };

  const handleDownloadB64 = async () => {
    if (!b64Preview) return;
    const res = await fetch(b64Preview);
    const blob = await res.blob();
    downloadBlob(blob, "image-from-base64.png");
  };

  const copy = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Switch
          checked={mode === "base64-to-image"}
          onCheckedChange={(v) => setMode(v ? "base64-to-image" : "image-to-base64")}
          id="mode-toggle"
        />
        <Label htmlFor="mode-toggle">
          {mode === "image-to-base64" ? "Image → Base64" : "Base64 → Image"}
        </Label>
      </div>

      {mode === "image-to-base64" && (
        <>
          <ImageDropzone onFile={handleFile} />

          {file && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{file.name}</p>
              <p>{(file.size / 1024).toFixed(1)} KB — {file.type}</p>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
          )}

          {dataUri && rawBase64 && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-pink-600">Data URI</p>
                  <button
                    onClick={() => copy(dataUri, setCopiedUri)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedUri ? <><Check className="w-3 h-3 text-green-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={dataUri}
                  rows={4}
                  className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 resize-none text-muted-foreground"
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-pink-600">Raw Base64</p>
                  <button
                    onClick={() => copy(rawBase64, setCopiedRaw)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedRaw ? <><Check className="w-3 h-3 text-green-500" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={rawBase64}
                  rows={4}
                  className="w-full text-xs font-mono bg-background border border-border rounded-lg p-2 resize-none text-muted-foreground"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Base64 length: {rawBase64.length.toLocaleString()} characters (~{(rawBase64.length * 0.75 / 1024).toFixed(1)} KB decoded)
              </p>
            </div>
          )}
        </>
      )}

      {mode === "base64-to-image" && (
        <div className="flex flex-col gap-4">
          <div>
            <Label className="mb-1.5 block">Paste Base64 or Data URI</Label>
            <textarea
              value={b64Input}
              onChange={(e) => setB64Input(e.target.value)}
              rows={6}
              placeholder="data:image/png;base64,iVBORw0KGgo... or raw base64"
              className="w-full text-xs font-mono bg-background border border-border rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-pink-500/40"
            />
          </div>

          <Button onClick={handleB64Decode} disabled={!b64Input.trim()} className="bg-pink-500 hover:bg-pink-600 text-white gap-2 self-start">
            <Binary className="w-4 h-4" /> Decode
          </Button>

          {b64Error && (
            <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{b64Error}</div>
          )}

          {b64Preview && (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-sm font-medium text-pink-600">Decoded Image</p>
              <img src={b64Preview} alt="Decoded" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
              <Button variant="outline" onClick={handleDownloadB64} className="gap-2 self-start">
                <Download className="w-4 h-4" /> Download
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
