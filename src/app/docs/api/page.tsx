import Link from "next/link";
import { Zap, Lock, Gauge, Terminal, ExternalLink, ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { registry } from "@/registry";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryColors } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

export const metadata = { title: "API Reference | MonkKit" };

const BASE_URL = "https://tools.devops-monk.com";

const STATUS_COLORS: Record<string, string> = {
  "401": "text-red-500 bg-red-500/10 dark:text-red-400",
  "403": "text-orange-500 bg-orange-500/10 dark:text-orange-400",
  "404": "text-orange-500 bg-orange-500/10 dark:text-orange-400",
  "429": "text-yellow-600 bg-yellow-500/10 dark:text-yellow-400",
  "400": "text-orange-500 bg-orange-500/10 dark:text-orange-400",
  "500": "text-red-500 bg-red-500/10 dark:text-red-400",
};

function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      {label && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <span className="text-xs text-muted-foreground ml-1">{label}</span>
        </div>
      )}
      <pre className="bg-[#0d1117] text-[#e6edf3] p-5 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre">
        {children}
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  const allTools = registry.tools;
  const totalTools = allTools.length;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      {/* Hero */}
      <div className="relative border-b border-border bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.535 0.233 264 / 0.2) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Terminal className="h-3.5 w-3.5" />
              REST API · v1
            </span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">API Reference</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Every MonkKit tool is available as a JSON REST API —
            one endpoint pattern, one API key, {totalTools} tools.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
            >
              <Zap className="h-4 w-4" fill="currentColor" />
              Get your free API key
            </Link>
            <a
              href="#endpoints"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-base font-semibold hover:bg-muted/50 transition-colors"
            >
              Browse endpoints
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-8 py-14">

        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-primary/10 p-2.5"><Lock className="h-5 w-5 text-primary" /></div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">Required</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Authentication</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Pass your API key as a Bearer token in every request.
            </p>
            <code className="block text-xs bg-muted rounded-lg px-3 py-2.5 font-mono text-muted-foreground">
              Authorization: Bearer mk_live_…
            </code>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-primary/10 p-2.5"><Zap className="h-5 w-5 text-primary" /></div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">Pattern</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Endpoint</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              All tools share the same URL pattern. Always POST with a JSON body.
            </p>
            <code className="block text-xs bg-muted rounded-lg px-3 py-2.5 font-mono text-muted-foreground">
              POST /api/v1/<span className="text-primary">category</span>/<span className="text-primary">tool</span>
            </code>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-xl bg-primary/10 p-2.5"><Gauge className="h-5 w-5 text-primary" /></div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">Free tier</span>
            </div>
            <h3 className="font-semibold text-base mb-2">Rate Limit</h3>
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              Generous daily quota for building and automation.
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold">1,000</span>
              <span className="text-sm text-muted-foreground">requests / day</span>
            </div>
          </div>
        </div>

        {/* Quick start */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-1">Quick Start</h2>
          <p className="text-muted-foreground mb-5 text-base">Validate a JSON string in one curl command.</p>
          <CodeBlock label="terminal">{`curl -X POST ${BASE_URL}/api/v1/json/validator \\
  -H "Authorization: Bearer <your-api-key>" \\
  -H "Content-Type: application/json" \\
  -d '{"input": "{\\"name\\": \\"Alice\\", \\"age\\": 32}"}'`}</CodeBlock>
          <div className="mt-4">
            <CodeBlock label="response.json">{`{
  "success": true,
  "tool": "json-validator",
  "result": {
    "valid": true,
    "formatted": "{\\n  \\"name\\": \\"Alice\\",\\n  \\"age\\": 32\\n}"
  }
}`}</CodeBlock>
          </div>
        </section>

        {/* Response format */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-1">Response Format</h2>
          <p className="text-muted-foreground mb-5 text-base">
            Every endpoint returns the same wrapper — check{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">success</code> first, then read{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">result</code>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2">✓ Success</p>
              <CodeBlock>{`{
  "success": true,
  "tool": "json-validator",
  "result": { ... }
}`}</CodeBlock>
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive mb-2">✗ Error</p>
              <CodeBlock>{`{
  "error": "Invalid API key"
}`}</CodeBlock>
            </div>
          </div>
        </section>

        {/* Error codes */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-1">Error Codes</h2>
          <p className="text-muted-foreground mb-5 text-base">Standard HTTP status codes indicate what went wrong.</p>
          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-5 py-3.5 text-sm font-semibold">Status</th>
                  <th className="text-left px-5 py-3.5 text-sm font-semibold">Meaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["401", "Missing or invalid API key"],
                  ["403", "API key lacks permission for this category"],
                  ["404", "Tool not found — check category/slug spelling"],
                  ["429", "Daily rate limit exceeded — resets at midnight UTC"],
                  ["400", "Invalid JSON request body"],
                  ["500", "Tool execution error — check your input"],
                ].map(([code, msg]) => (
                  <tr key={code} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <span className={cn("inline-block font-mono text-sm font-bold px-2.5 py-1 rounded-lg", STATUS_COLORS[code])}>
                        {code}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{msg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* All endpoints by category */}
        <section id="endpoints">
          <h2 className="text-2xl font-bold mb-1">All Endpoints</h2>
          <p className="text-muted-foreground mb-8 text-base">
            {totalTools} endpoints across {registry.categories.length} categories.
            Open any tool to see its full API tab with a ready-to-run curl example and request body schema.
          </p>

          <div className="flex flex-col gap-8">
            {registry.categories.map((category) => {
              const tools = registry.tools.filter((t) => t.category === category.id);
              if (!tools.length) return null;
              const Icon = getCategoryIcon(category.icon);
              const colors = getCategoryColors(category.color);

              return (
                <div key={category.id} className="rounded-2xl border border-border overflow-hidden">
                  {/* Category header */}
                  <div className={cn("flex items-center gap-4 px-6 py-4 border-b border-border", colors.iconBg + "/40")}>
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", colors.iconBg)}>
                      <Icon className={cn("h-5 w-5", colors.iconText)} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{category.name}</h3>
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", colors.badgeBg, colors.badgeText)}>
                          {tools.length} tools
                        </span>
                      </div>
                      <code className="text-xs text-muted-foreground font-mono">
                        POST {BASE_URL}/api/v1/{category.slug}/<span className={colors.activeText}>tool</span>
                      </code>
                    </div>
                  </div>

                  {/* Tool rows */}
                  <div className="divide-y divide-border">
                    {tools.map((tool) => {
                      const ToolIcon = getCategoryIcon(tool.icon);
                      return (
                        <div key={tool.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/20 transition-colors group">
                          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", colors.iconBg)}>
                            <ToolIcon className={cn("h-3.5 w-3.5", colors.iconText)} />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{tool.name}</p>
                            <code className="text-xs text-muted-foreground font-mono">
                              /api/v1/{tool.category}/{tool.slug}
                            </code>
                          </div>
                          <p className="hidden md:block text-sm text-muted-foreground flex-1 min-w-0 truncate">
                            {tool.shortDescription}
                          </p>
                          <Link
                            href={`/tools/${tool.category}/${tool.slug}`}
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            API tab <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      <AppFooter />
    </div>
  );
}
