"use client";

import { useState, useCallback } from "react";
import { ImageDropzone, downloadBlob, loadImageFromFile, canvasToBlob } from "@/components/tool-ui/ImageDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePen, Download } from "lucide-react";
import type { ToolComponentProps } from "@/types/registry";

type Position =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

const POSITIONS: Position[] = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const FONTS = ["Arial", "Georgia", "Courier New", "Impact"];

function getTextCoords(pos: Position, canvasW: number, canvasH: number, textW: number, fontSize: number, padding: number): { x: number; y: number; align: CanvasTextAlign; baseline: CanvasTextBaseline } {
  const [v, h] = pos.split("-") as [string, string];
  let x = 0;
  let align: CanvasTextAlign = "left";
  if (h === "left") { x = padding; align = "left"; }
  else if (h === "center") { x = canvasW / 2; align = "center"; }
  else { x = canvasW - padding; align = "right"; }

  let y = 0;
  let baseline: CanvasTextBaseline = "top";
  if (v === "top") { y = padding + fontSize; baseline = "alphabetic"; }
  else if (v === "middle") { y = canvasH / 2; baseline = "middle"; }
  else { y = canvasH - padding; baseline = "alphabetic"; }

  return { x, y, align, baseline };
}

export default function ImageWatermarkTool({ toolMeta: _ }: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("© MonkKit");
  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(70);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [color, setColor] = useState("#ffffff");
  const [font, setFont] = useState("Arial");
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
    if (!file || !text) return;
    setProcessing(true);
    setError(null);
    try {
      const img = await loadImageFromFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);

      const padding = Math.round(Math.min(img.naturalWidth, img.naturalHeight) * 0.03);
      ctx.font = `${fontSize}px ${font}`;
      const textW = ctx.measureText(text).width;
      const { x, y, align, baseline } = getTextCoords(position, canvas.width, canvas.height, textW, fontSize, padding);

      ctx.globalAlpha = opacity / 100;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 1;

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
    downloadBlob(result.blob, `watermarked.${ext}`);
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

          <div>
            <Label className="mb-1.5 block">Watermark Text</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="© Your Brand" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Font</Label>
              <Select value={font} onValueChange={(v) => setFont(v ?? font)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Position</Label>
              <Select value={position} onValueChange={(v) => setPosition(v as Position)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p.replace(/-/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Font Size: {fontSize}px</Label>
            <Slider min={8} max={200} step={1} defaultValue={[32]}
              onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setFontSize(arr[0] as number); }} />
          </div>

          <div>
            <Label className="mb-2 block">Opacity: {opacity}%</Label>
            <Slider min={1} max={100} step={1} defaultValue={[70]}
              onValueChange={(v) => { const arr = Array.isArray(v) ? v : [v]; setOpacity(arr[0] as number); }} />
          </div>

          <div>
            <Label className="mb-1.5 block">Text Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 rounded-lg cursor-pointer border border-border" />
              <span className="text-sm text-muted-foreground font-mono">{color}</span>
            </div>
          </div>

          <Button onClick={handleProcess} disabled={processing || !text} className="bg-pink-500 hover:bg-pink-600 text-white gap-2">
            <FilePen className="w-4 h-4" />
            {processing ? "Adding watermark…" : "Add Watermark"}
          </Button>
        </>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</div>
      )}

      {result && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-sm font-medium text-pink-600">Watermarked Image</p>
          <img src={result.url} alt="Watermarked" className="max-h-60 object-contain rounded-lg border border-border bg-muted/30" />
          <Button variant="outline" onClick={handleDownload} className="gap-2 self-start">
            <Download className="w-4 h-4" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
