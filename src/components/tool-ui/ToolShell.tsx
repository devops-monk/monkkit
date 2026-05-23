"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToolBreadcrumb } from "@/components/layout/ToolBreadcrumb";
import { getCategoryColors } from "@/lib/category-colors";
import { registry } from "@/registry";
import { getCategoryIcon } from "@/lib/category-icons";
import type { ToolMeta } from "@/types/registry";
import { API_EXAMPLES } from "@/registry/api-examples";
import { useClipboard } from "@/hooks/useClipboard";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  meta: ToolMeta;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const STATUS_VARIANT: Record<ToolMeta["status"], "default" | "secondary" | "outline"> = {
  stable: "secondary",
  beta: "outline",
  new: "default",
};

const BASE_URL = "https://tools.devops-monk.com";

function buildCurlBody(example: Record<string, unknown> | undefined): string {
  if (!example) return '\'{"input": "..."}\'';
  const keys = Object.keys(example);
  if (keys.length === 0) return "'{}'";
  const body = JSON.stringify(example, null, 2);
  // Indent continuation lines to align under -d '
  const indented = body.replace(/\n/g, "\n    ");
  return `'${indented}'`;
}

function CurlBlock({ curl }: { curl: string }) {
  const { copied, copy } = useClipboard();
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-400/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
          <div className="h-3 w-3 rounded-full bg-green-400/80" />
        </div>
        <span className="text-xs text-muted-foreground ml-1 flex-1">terminal</span>
        <button
          onClick={() => copy(curl)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-[#8b949e] hover:text-[#e6edf3] hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="bg-[#0d1117] text-[#e6edf3] p-5 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
        {curl}
      </pre>
    </div>
  );
}

interface UserKey {
  id: string;
  key: string;
  name: string;
  permissions: string[];
}

function ApiUsagePanel({ meta }: { meta: ToolMeta }) {
  const [keys, setKeys] = useState<UserKey[]>([]);

  useEffect(() => {
    fetch("/api/user/keys")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.keys) setKeys(data.keys); })
      .catch(() => {});
  }, []);

  // Priority: saved default key (localStorage) > key matching category > first key
  const savedDefaultId = typeof window !== "undefined" ? localStorage.getItem("monkkit_default_key_id") : null;
  const defaultKey = keys.find((k) => k.id === savedDefaultId) ?? keys[0] ?? null;
  const matchingKey =
    (defaultKey?.permissions.includes(meta.category) ? defaultKey : null) ??
    keys.find((k) => k.permissions.includes(meta.category)) ??
    null;
  const activeKey = matchingKey ?? defaultKey ?? null;
  const hasPermission = !!matchingKey;
  const noPermissionKey = activeKey && !hasPermission;

  const endpoint = `/api/v1/${meta.category}/${meta.slug}`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  const example = API_EXAMPLES[meta.id];
  const bodyStr = buildCurlBody(example);
  const keyDisplay = activeKey?.key ?? "<your-api-key>";
  const curl = `curl -X POST ${fullUrl} \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d ${bodyStr}`;

  return (
    <div className="flex flex-col gap-5 py-2 max-w-3xl">
      {/* About */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-base font-semibold mb-2">About this tool</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{meta.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {meta.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Endpoint */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-base font-semibold mb-4">API Endpoint</h3>
        <div className="flex items-center gap-2 mb-5 p-3 rounded-lg bg-muted/60">
          <span className="shrink-0 rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold font-mono text-primary">POST</span>
          <code className="text-sm font-mono break-all">{endpoint}</code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          <div className={cn(
            "rounded-lg p-3.5 transition-colors",
            hasPermission ? "bg-green-500/8 border border-green-500/20"
            : noPermissionKey ? "bg-amber-500/8 border border-amber-500/20"
            : "bg-muted/50"
          )}>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Authentication</p>
              {hasPermission && (
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                  ✓ key auto-filled
                </span>
              )}
              {noPermissionKey && (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  ⚠ no {meta.category} access
                </span>
              )}
            </div>
            <code className="text-xs font-mono break-all">
              Authorization: Bearer {activeKey ? `${activeKey.key.slice(0, 18)}…` : "mk_live_…"}
            </code>
            {!activeKey && (
              <p className="text-xs text-muted-foreground mt-2">
                <Link href="/auth/signin" className="text-primary hover:underline">Sign in</Link> to auto-fill your key
              </p>
            )}
          </div>
          <div className="rounded-lg bg-muted/50 p-3.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content-Type</p>
            <code className="text-xs font-mono">application/json</code>
          </div>
        </div>

        {/* Permission warning banner */}
        {noPermissionKey && (
          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3.5 flex items-start gap-3">
            <span className="text-amber-500 text-lg leading-none mt-0.5">⚠</span>
            <div className="text-sm">
              <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                Your key &ldquo;{activeKey!.name}&rdquo; doesn&apos;t have access to the <strong>{meta.category}</strong> category.
              </p>
              <p className="text-muted-foreground">
                Go to your{" "}
                <Link href="/dashboard" className="text-primary hover:underline font-medium">dashboard</Link>
                {" "}and create a new key with <strong>{meta.category}</strong> selected, or edit the existing key&apos;s permissions.
                Current access: {activeKey!.permissions.join(", ")}.
              </p>
            </div>
          </div>
        )}

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">curl Example</p>
        <CurlBlock curl={curl} />

        {/* Request body field reference */}
        {example && Object.keys(example).length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Request Body Fields</p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">Field</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/4">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Example value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(example).map(([key, val], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                      <td className="px-4 py-2.5 font-mono text-sm text-primary">{key}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">
                        {Array.isArray(val) ? "array" : typeof val}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground max-w-xs truncate">
                        {Array.isArray(val)
                          ? JSON.stringify(val)
                          : typeof val === "string"
                          ? val.length > 60 ? val.slice(0, 60) + "…" : val
                          : String(val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No-input note */}
        {example && Object.keys(example).length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground rounded-lg bg-muted/40 px-4 py-3">
            This endpoint requires no request body — send an empty JSON object <code className="font-mono">{"{}"}</code>.
          </p>
        )}
      </div>

      {/* Response format */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-base font-semibold mb-4">Response Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">✓ Success</p>
            <pre className="bg-[#0d1117] text-[#e6edf3] rounded-xl p-4 text-sm font-mono leading-relaxed">{`{
  "success": true,
  "tool": "${meta.id}",
  "result": { ... }
}`}</pre>
          </div>
          <div>
            <p className="text-sm font-medium text-destructive mb-2">✗ Error</p>
            <pre className="bg-[#0d1117] text-[#e6edf3] rounded-xl p-4 text-sm font-mono leading-relaxed">{`{
  "error": "...",
  "detail": "..."
}`}</pre>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Need an API key?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline font-medium">Sign in for free</Link>
          {" · "}
          <Link href="/docs/api" className="text-primary hover:underline font-medium">Full API docs</Link>
        </p>
      </div>
    </div>
  );
}

export function ToolShell({ meta, children, actions }: Props) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "api" ? "api" : "tool";
  const category = registry.categories.find((c) => c.id === meta.category);
  const colors = getCategoryColors(category?.color ?? "");
  const Icon = getCategoryIcon(category?.icon ?? "");

  return (
    <div className="flex flex-col min-h-full">
      {/* Colored top band */}
      <div className={cn("border-b border-border px-5 lg:px-8 pt-5 pb-4", colors.iconBg + "/30")}>
        <ToolBreadcrumb tool={meta} />

        <div className="flex items-start justify-between gap-4 mt-3">
          <div className="flex items-start gap-4">
            <div className={cn("rounded-xl p-2.5 shrink-0", colors.iconBg)}>
              <Icon className={cn("h-6 w-6", colors.iconText)} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold">{meta.name}</h1>
                {meta.status !== "stable" && (
                  <Badge variant={STATUS_VARIANT[meta.status]} className="capitalize text-xs">
                    {meta.status}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm max-w-prose">
                {meta.shortDescription}
              </p>
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 px-5 lg:px-8 py-5">
        <Tabs defaultValue={initialTab} className="gap-0">
          <TabsList className="mb-5">
            <TabsTrigger value="tool">Tool</TabsTrigger>
            <TabsTrigger value="api">API Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="tool">
            <div className="min-h-0">{children}</div>
          </TabsContent>

          <TabsContent value="api">
            <ApiUsagePanel meta={meta} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
