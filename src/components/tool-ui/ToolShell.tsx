"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToolBreadcrumb } from "@/components/layout/ToolBreadcrumb";
import { getCategoryColors } from "@/lib/category-colors";
import { registry } from "@/registry";
import { getCategoryIcon } from "@/lib/category-icons";
import type { ToolMeta } from "@/types/registry";
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

function ApiUsagePanel({ meta }: { meta: ToolMeta }) {
  const endpoint = `/api/v1/${meta.category}/${meta.slug}`;
  const fullUrl = `${BASE_URL}${endpoint}`;
  const curl = `curl -X POST ${fullUrl} \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "..."}'`;

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
          <div className="rounded-lg bg-muted/50 p-3.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Authentication</p>
            <code className="text-xs font-mono">Authorization: Bearer mk_live_…</code>
          </div>
          <div className="rounded-lg bg-muted/50 p-3.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Content-Type</p>
            <code className="text-xs font-mono">application/json</code>
          </div>
        </div>

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">curl Example</p>
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-green-400/80" />
            </div>
            <span className="text-xs text-muted-foreground ml-1">terminal</span>
          </div>
          <pre className="bg-[#0d1117] text-[#e6edf3] p-5 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {curl}
          </pre>
        </div>
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
        <Tabs defaultValue="tool" className="gap-0">
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
