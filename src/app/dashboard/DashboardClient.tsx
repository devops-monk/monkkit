"use client";

import { useState, useTransition, useRef } from "react";
import {
  Eye, EyeOff, BookOpen, Plus, Trash2, Key, AlertCircle,
  Activity, Coffee, Zap, CheckCircle2, Clock, Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { CopyButton } from "@/components/tool-ui/CopyButton";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";
import { getCategoryColors } from "@/lib/category-colors";
import type { ToolCategory } from "@/types/registry";

const USAGE_LIMIT = 100;

interface ApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: Date;
  lastUsed: Date | null;
  usageToday: number;
  permissions: { category: string }[];
}

interface Props {
  keys: ApiKey[];
  categories: ToolCategory[];
  userName: string;
  userImage?: string | null;
}

// ── Create Key Form ─────────────────────────────────────────────────────────

function CreateKeyForm({
  categories,
  onDone,
}: {
  categories: ToolCategory[];
  onDone: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(categories.map((c) => c.id))
  );

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (selected.size === 0) { setError("Select at least one category."); return; }
    const fd = new FormData(formRef.current!);
    selected.forEach((c) => fd.append("categories", c));
    startTransition(async () => {
      try {
        await createApiKeyAction(fd);
        onDone();
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="block text-sm font-semibold mb-2">Key name</label>
        <input
          name="name"
          required
          placeholder='e.g. "JSON Bot", "CI Pipeline"'
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">Allowed categories</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((cat) => {
            const on = selected.has(cat.id);
            const colors = getCategoryColors(cat.color);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(cat.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                  on
                    ? `${colors.activeBg} ${colors.border} ${colors.activeText}`
                    : "border-border text-muted-foreground hover:border-border hover:bg-muted/50"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${on ? colors.iconText.replace("text-", "bg-") : "bg-muted-foreground/40"}`} />
                {cat.name}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          This key can only call tools in the selected categories.
        </p>
      </div>

      {error && (
        <p className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={pending} className="gap-2">
          <Zap className="h-4 w-4" />
          {pending ? "Creating…" : "Create key"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ── Key Card ─────────────────────────────────────────────────────────────────

function KeyCard({ apiKey, categories }: { apiKey: ApiKey; categories: ToolCategory[] }) {
  const [visible, setVisible] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const displayKey = visible
    ? apiKey.key
    : apiKey.key.slice(0, 12) + "•".repeat(24);

  const pct = Math.min((apiKey.usageToday / USAGE_LIMIT) * 100, 100);
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));
  const allowedCats = apiKey.permissions.map((p) => catMap[p.category]).filter(Boolean);
  const remaining = USAGE_LIMIT - apiKey.usageToday;

  const barColor = pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-primary";

  const handleRevoke = () => {
    startTransition(async () => { await revokeApiKeyAction(apiKey.id); });
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Key className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base truncate">{apiKey.name}</p>
            <p className="text-xs text-muted-foreground">
              Created {new Date(apiKey.createdAt).toLocaleDateString("en-GB")}
              {apiKey.lastUsed && <> · Last used {new Date(apiKey.lastUsed).toLocaleDateString("en-GB")}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
        </div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Category pills */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            Allowed categories
          </p>
          <div className="flex flex-wrap gap-2">
            {allowedCats.map((cat) => {
              const colors = getCategoryColors(cat.color);
              return (
                <span key={cat.id} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText}`}>
                  {cat.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* API Key */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
            API Key
          </p>
          <div className="flex items-center gap-2 rounded-xl bg-[#0d1117] border border-border px-4 py-3">
            <code className="flex-1 text-sm font-mono text-[#e6edf3] break-all select-all">
              {displayKey}
            </code>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setVisible((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/10 transition-colors"
                title={visible ? "Hide key" : "Reveal key"}
              >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <CopyButton value={apiKey.key} label="" />
            </div>
          </div>
        </div>

        {/* Usage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daily Usage
            </p>
            <span className="text-xs font-semibold tabular-nums">
              {apiKey.usageToday} <span className="text-muted-foreground font-normal">/ {USAGE_LIMIT}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${pct || 2}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            {remaining.toLocaleString()} requests remaining today · resets at midnight UTC
          </p>
        </div>

        {/* Revoke */}
        <div className="flex items-center justify-end pt-1 border-t border-border">
          {confirming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">Revoke this key?</span>
              <Button size="sm" variant="destructive" disabled={pending} onClick={handleRevoke} className="h-8">
                {pending ? "…" : "Yes, revoke"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => setConfirming(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Revoke key
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function DashboardClient({ keys, categories, userName, userImage }: Props) {
  const [creating, setCreating] = useState(false);
  const donateUrl = process.env.NEXT_PUBLIC_DONATE_URL ?? "https://buymeacoffee.com";

  const totalUsageToday = keys.reduce((s, k) => s + k.usageToday, 0);
  const firstKey = keys[0];
  const firstName = userName ? userName.split(" ")[0] : "there";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 lg:px-8 py-10">

        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden border border-border mb-8 bg-gradient-to-br from-primary/10 via-background to-background">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.535 0.233 264 / 0.3) 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative flex items-center justify-between gap-4 px-7 py-6">
            <div className="flex items-center gap-4">
              {userImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userImage} alt={userName} className="h-14 w-14 rounded-full ring-2 ring-primary/30 shrink-0" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0 ring-2 ring-primary/30">
                  <span className="text-xl font-bold text-primary">{firstName[0]?.toUpperCase()}</span>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm font-medium">Welcome back,</p>
                <h1 className="text-3xl font-extrabold">{firstName}!</h1>
              </div>
            </div>
            <Button onClick={() => setCreating((v) => !v)} className="gap-2 shrink-0" size="lg">
              <Plus className="h-5 w-5" />
              {creating ? "Cancel" : "New API Key"}
            </Button>
          </div>
        </div>

        {/* Create key form */}
        {creating && (
          <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-lg font-bold">Create New API Key</h2>
            </div>
            <CreateKeyForm categories={categories} onDone={() => setCreating(false)} />
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Active Keys</p>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tabular-nums">{keys.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Requests Today</p>
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tabular-nums">{totalUsageToday.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Daily Limit</p>
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            </div>
            <p className="text-4xl font-extrabold tabular-nums">1,000</p>
            <p className="text-xs text-muted-foreground mt-1">per key · resets midnight UTC</p>
          </div>
        </div>

        {/* Keys section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Your API Keys</h2>
            {keys.length > 0 && (
              <span className="ml-auto text-sm text-muted-foreground">{keys.length} key{keys.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {keys.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-14 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-lg font-semibold mb-1">No API keys yet</p>
              <p className="text-muted-foreground mb-5">Create your first key to start automating with the API.</p>
              <Button onClick={() => setCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Create First Key
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {keys.map((k) => (
                <KeyCard key={k.id} apiKey={k} categories={categories} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Start */}
        {firstKey && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <h2 className="font-bold text-base">Quick Start</h2>
              </div>
              <Link
                href="/docs/api"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
              >
                <BookOpen className="h-4 w-4" />
                Full API reference
              </Link>
            </div>
            <div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                </div>
                <span className="text-xs text-[#8b949e] ml-1">terminal</span>
              </div>
              <pre className="bg-[#0d1117] text-[#e6edf3] px-6 py-5 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre">
{`curl -X POST https://tools.devops-monk.com/api/v1/json/validator \\
  -H "Authorization: Bearer ${firstKey.key}" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "{\\"name\\": \\"Alice\\"}"}'`}
              </pre>
            </div>
            <div className="px-6 py-3 border-t border-border bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Pattern:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">
                  POST /api/v1/<span className="text-primary">category</span>/<span className="text-primary">tool</span>
                </code>
                {" "}— returns <code className="bg-muted px-1 rounded font-mono text-xs">403</code> if the key lacks permission for that category.
              </p>
            </div>
          </div>
        )}

        {/* Info row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-1">Rate limit resets daily</p>
              <p className="text-sm text-muted-foreground">
                Each key gets 1,000 free requests per day. Resets at midnight UTC.
                Need more? Email us.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm mb-1">Scoped permissions</p>
              <p className="text-sm text-muted-foreground">
                Each key only accesses the categories you chose. Revoke any key instantly from this dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* Donate */}
        <div className="rounded-2xl border border-yellow-500/25 bg-gradient-to-r from-yellow-500/8 to-amber-500/5 p-6 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-yellow-500/15 flex items-center justify-center text-2xl">
            ☕
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base mb-0.5">Enjoying MonkKit?</p>
            <p className="text-sm text-muted-foreground">
              It&apos;s free and always will be. If it saves you time, consider buying me a coffee.
            </p>
          </div>
          <a
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 px-4 py-2.5 text-sm font-bold text-yellow-950 transition-colors"
          >
            <Coffee className="h-4 w-4" />
            Buy me a coffee
          </a>
        </div>

      </main>

      <AppFooter />
    </div>
  );
}
