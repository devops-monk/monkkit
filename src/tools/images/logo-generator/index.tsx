"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { downloadBlob } from "@/components/tool-ui/ImageDropzone";
import type { ToolComponentProps } from "@/types/registry";
import { Download, RefreshCw } from "lucide-react";

const FONTS = [
  "Inter", "Georgia", "Arial", "Verdana", "Trebuchet MS",
  "Impact", "Courier New", "Times New Roman", "Palatino",
];

const PRESETS = [
  { label: "App Icon",   size: 512,  shape: "rounded" as const, padding: 80  },
  { label: "Favicon",    size: 192,  shape: "rounded" as const, padding: 40  },
  { label: "Square",     size: 512,  shape: "square"  as const, padding: 60  },
  { label: "Circle",     size: 512,  shape: "circle"  as const, padding: 80  },
  { label: "Banner",     size: 800,  shape: "wide"    as const, padding: 60  },
  { label: "Twitter",    size: 400,  shape: "circle"  as const, padding: 60  },
];

const GRADIENT_PRESETS = [
  { label: "Indigo → Violet",   c1: "#6366f1", c2: "#8b5cf6" },
  { label: "Sky → Cyan",        c1: "#0ea5e9", c2: "#06b6d4" },
  { label: "Rose → Orange",     c1: "#f43f5e", c2: "#f97316" },
  { label: "Emerald → Teal",    c1: "#10b981", c2: "#14b8a6" },
  { label: "Amber → Yellow",    c1: "#f59e0b", c2: "#eab308" },
  { label: "Slate → Gray",      c1: "#334155", c2: "#64748b" },
  { label: "Black → Charcoal",  c1: "#000000", c2: "#1f2937" },
];

type Shape = "square" | "rounded" | "circle" | "wide";
type GradDir = "to-r" | "to-br" | "to-b" | "radial";

function drawLogo(canvas: HTMLCanvasElement, opts: {
  text: string; tagline: string; font: string; fontSize: number;
  textColor: string; bgType: "solid" | "gradient" | "transparent";
  bgColor: string; bgColor2: string; gradDir: GradDir;
  shape: Shape; canvasSize: number; padding: number;
  bold: boolean; taglineSize: number; letterSpacing: number;
  shadow: boolean; shadowColor: string;
}) {
  const { text, tagline, font, fontSize, textColor, bgType, bgColor, bgColor2,
    gradDir, shape, canvasSize, padding, bold, taglineSize, letterSpacing, shadow, shadowColor } = opts;

  const isWide = shape === "wide";
  const w = isWide ? Math.round(canvasSize * 2.5) : canvasSize;
  const h = canvasSize;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  // Clip to shape
  ctx.save();
  const r = shape === "rounded" ? h * 0.2 : shape === "circle" ? h / 2 : 0;
  ctx.beginPath();
  if (shape === "circle") {
    ctx.arc(w / 2, h / 2, h / 2, 0, Math.PI * 2);
  } else if (r > 0) {
    ctx.roundRect(0, 0, w, h, r);
  } else {
    ctx.rect(0, 0, w, h);
  }
  ctx.clip();

  // Background
  if (bgType !== "transparent") {
    if (bgType === "solid") {
      ctx.fillStyle = bgColor;
    } else {
      let grad: CanvasGradient;
      if (gradDir === "radial") {
        grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      } else if (gradDir === "to-r") {
        grad = ctx.createLinearGradient(0, 0, w, 0);
      } else if (gradDir === "to-b") {
        grad = ctx.createLinearGradient(0, 0, 0, h);
      } else {
        grad = ctx.createLinearGradient(0, 0, w, h);
      }
      grad.addColorStop(0, bgColor);
      grad.addColorStop(1, bgColor2);
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();

  // Text shadow
  if (shadow) {
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = fontSize * 0.3;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = fontSize * 0.05;
  }

  // Primary text
  const weight = bold ? "bold" : "600";
  ctx.font = `${weight} ${fontSize}px "${font}", sans-serif`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Letter spacing shim
  if (letterSpacing !== 0) {
    const chars = text.split("");
    const totalW = chars.reduce((acc, ch) => acc + ctx.measureText(ch).width, 0)
      + letterSpacing * (chars.length - 1);
    let x = w / 2 - totalW / 2;
    const y = tagline ? h / 2 - fontSize * 0.55 : h / 2;
    for (const ch of chars) {
      const cw = ctx.measureText(ch).width;
      ctx.fillText(ch, x + cw / 2, y);
      x += cw + letterSpacing;
    }
  } else {
    const y = tagline ? h / 2 - fontSize * 0.55 : h / 2;
    ctx.fillText(text, w / 2, y);
  }

  // Tagline
  if (tagline) {
    ctx.shadowBlur = 0;
    ctx.font = `400 ${taglineSize}px "${font}", sans-serif`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(tagline, w / 2, h / 2 + fontSize * 0.65);
    ctx.globalAlpha = 1;
  }

  ctx.shadowBlur = 0;
}

export default function LogoGeneratorTool({ toolMeta: _ }: ToolComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [text, setText] = useState("MonkKit");
  const [tagline, setTagline] = useState("Free Developer Tools");
  const [font, setFont] = useState("Inter");
  const [fontSize, setFontSize] = useState(96);
  const [taglineSize, setTaglineSize] = useState(32);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgType, setBgType] = useState<"solid" | "gradient" | "transparent">("gradient");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [bgColor2, setBgColor2] = useState("#8b5cf6");
  const [gradDir, setGradDir] = useState<GradDir>("to-br");
  const [shape, setShape] = useState<Shape>("rounded");
  const [canvasSize, setCanvasSize] = useState(512);
  const [padding, setPadding] = useState(80);
  const [bold, setBold] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [shadow, setShadow] = useState(false);
  const [shadowColor, setShadowColor] = useState("#00000066");

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawLogo(canvas, {
      text, tagline, font, fontSize, textColor, bgType, bgColor, bgColor2,
      gradDir, shape, canvasSize, padding, bold, taglineSize, letterSpacing, shadow, shadowColor,
    });
  };

  useEffect(() => { redraw(); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [text, tagline, font, fontSize, taglineSize, textColor, bgType, bgColor, bgColor2,
      gradDir, shape, canvasSize, padding, bold, letterSpacing, shadow, shadowColor]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `logo-${text.toLowerCase().replace(/\s+/g, "-")}.png`);
    }, "image/png");
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setCanvasSize(p.size);
    setShape(p.shape);
    setPadding(p.padding);
  };

  const applyGradientPreset = (g: typeof GRADIENT_PRESETS[0]) => {
    setBgColor(g.c1);
    setBgColor2(g.c2);
    setBgType("gradient");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 max-w-5xl mx-auto">

      {/* Controls */}
      <div className="flex flex-col gap-5 w-full lg:w-72 shrink-0">

        {/* Canvas presets */}
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Size Preset</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => applyPreset(p)}
                className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Text</Label>
          <div className="flex flex-col gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Logo text" />
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Tagline (optional)" />
          </div>
        </div>

        {/* Font */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Font</Label>
          <Select value={font} onValueChange={(v) => setFont(v ?? font)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {FONTS.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Size (px)</Label>
              <Input type="number" value={fontSize} min={12} max={300}
                onChange={(e) => setFontSize(Number(e.target.value))} className="font-mono h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Tagline (px)</Label>
              <Input type="number" value={taglineSize} min={8} max={100}
                onChange={(e) => setTaglineSize(Number(e.target.value))} className="font-mono h-8 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Switch checked={bold} onCheckedChange={setBold} />
              <Label className="text-sm cursor-pointer" onClick={() => setBold((v) => !v)}>Bold</Label>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Spacing</Label>
              <Input type="number" value={letterSpacing} min={-10} max={40}
                onChange={(e) => setLetterSpacing(Number(e.target.value))} className="font-mono h-8 text-sm" />
            </div>
          </div>
        </div>

        {/* Shape */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shape</Label>
          <div className="grid grid-cols-4 gap-1.5">
            {(["square", "rounded", "circle", "wide"] as Shape[]).map((s) => (
              <button key={s} onClick={() => setShape(s)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors
                  ${shape === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Colors</Label>

          <div className="flex items-center gap-2">
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
              className="h-8 w-8 rounded-lg border border-border cursor-pointer" />
            <span className="text-sm text-muted-foreground">Text color</span>
          </div>

          {/* BG type */}
          <div className="grid grid-cols-3 gap-1.5">
            {(["solid", "gradient", "transparent"] as const).map((t) => (
              <button key={t} onClick={() => setBgType(t)}
                className={`rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors
                  ${bgType === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                {t}
              </button>
            ))}
          </div>

          {bgType !== "transparent" && (
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="h-8 w-8 rounded-lg border border-border cursor-pointer" />
              <span className="text-xs text-muted-foreground">
                {bgType === "gradient" ? "Start" : "Background"}
              </span>
              {bgType === "gradient" && (
                <>
                  <input type="color" value={bgColor2} onChange={(e) => setBgColor2(e.target.value)}
                    className="h-8 w-8 rounded-lg border border-border cursor-pointer" />
                  <span className="text-xs text-muted-foreground">End</span>
                </>
              )}
            </div>
          )}

          {bgType === "gradient" && (
            <>
              <Select value={gradDir} onValueChange={(v) => setGradDir((v ?? gradDir) as GradDir)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-r">→ Left to right</SelectItem>
                  <SelectItem value="to-br">↘ Diagonal</SelectItem>
                  <SelectItem value="to-b">↓ Top to bottom</SelectItem>
                  <SelectItem value="radial">◎ Radial</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Gradient presets</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {GRADIENT_PRESETS.map((g) => (
                    <button key={g.label} onClick={() => applyGradientPreset(g)}
                      className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:border-primary/40 transition-colors">
                      <span className="h-4 w-4 rounded shrink-0"
                        style={{ background: `linear-gradient(to right, ${g.c1}, ${g.c2})` }} />
                      <span className="text-xs truncate">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Shadow */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Switch checked={shadow} onCheckedChange={setShadow} />
            <Label className="text-sm cursor-pointer" onClick={() => setShadow((v) => !v)}>Text shadow</Label>
            {shadow && (
              <input type="color" value={shadowColor.slice(0, 7)} onChange={(e) => setShadowColor(e.target.value + "99")}
                className="ml-auto h-7 w-7 rounded border border-border cursor-pointer" />
            )}
          </div>
        </div>

      </div>

      {/* Preview + download */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={redraw} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download PNG
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-[repeating-conic-gradient(#80808018_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] flex items-center justify-center p-6 min-h-64">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[480px] object-contain rounded-xl shadow-xl"
            style={{ imageRendering: "crisp-edges" }}
          />
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1.5">
          <span className="text-sm text-muted-foreground">
            Size: <code className="font-mono text-sm font-medium text-foreground">
              {shape === "wide" ? `${Math.round(canvasSize * 2.5)}×${canvasSize}` : `${canvasSize}×${canvasSize}`} px
            </code>
          </span>
          <span className="text-sm text-muted-foreground">
            Shape: <span className="font-medium text-foreground capitalize">{shape}</span>
          </span>
          <span className="text-sm text-muted-foreground">
            Format: <span className="font-medium text-foreground">PNG (transparent supported)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
