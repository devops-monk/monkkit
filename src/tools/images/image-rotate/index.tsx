"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RotateCw, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

const QUICK_ANGLES = [0, 90, 180, 270];

export default function ImageRotateTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [angle, setAngle] = useState(90);
  const [customAngle, setCustomAngle] = useState(0);
  const [useCustom, setUseCustom] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [result, setResult] = useState<{ url: string; blob: Blob } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }, []);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      const rad = ((useCustom ? customAngle : angle) * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const canvasW = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
      const canvasH = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const mimeType = file.type || "image/png";
      const blob = await canvasToBlob(canvas, mimeType, 0.92);
      setResult({ url: URL.createObjectURL(blob), blob });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const ext = file.name.split(".").pop() ?? "png";
    downloadBlob(result.blob, `rotated.${ext}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col gap-6">
      <ImageDropzone onFile={handleFile} />

      {file && preview && (
        <>
          <div className="flex gap-4 items-start">
            <img src={preview} alt="Original" className="w-28 h-20 object-contain rounded-lg border border-border bg-muted/30" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{file.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label className="mb-2 block">Quick Rotate</Label>
              <div className="flex gap-2 flex-wrap">
                {QUICK_ANGLES.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAngle(a); setUseCustom(false); }}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${!useCustom && angle === a ? "bg-pink-500 text-white border-pink-500" : "border-border hover:border-pink-500/50"}`}
                  >
                    {a}°
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={useCustom} onCheckedChange={setUseCustom} id="use-custom" />
              <Label htmlFor="use-custom">Custom angle</Label>
            </div>

            {useCustom && (
              <div>
                <Label className="mb-1.5 block">Angle (degrees)</Label>
                <Input
                  type="number"
                  value={customAngle}
                  onChange={(e) => setCustomAngle(Number(e.target.value))}
                  placeholder="e.g. 45"
                />
              </div>
            )}

            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={flipH} onCheckedChange={setFlipH} id="flip-h" />
                <Label htmlFor="flip-h">Flip Horizontal</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={flipV} onCheckedChange={setFlipV} id="flip-v" />
                <Label htmlFor="flip-v">Flip Vertical</Label>
              </div>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={processing} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <RotateCw className="w-4 h-4" />
            {processing ? "Rotating…" : "Apply Transform"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Result</p>
          <img src={result.url} alt="Rotated" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
