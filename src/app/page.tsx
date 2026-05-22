import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { registry } from "@/registry";
import { getCategoryIcon } from "@/lib/category-icons";
import { getCategoryColors } from "@/lib/category-colors";

export default function HomePage() {
  const totalTools = registry.tools.length;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/5 via-background to-background">
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.535 0.233 264 / 0.15) 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 right-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-3.5 w-3.5" fill="currentColor" />
            {totalTools} free tools, no login required
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Developer Tools<br />
            <span className="text-primary">That Just Work</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            JSON, encoding, DNS lookups, email health, cryptography, and more —
            all in one place. Every tool also available as a REST API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Browse all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/api"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold hover:bg-muted/50 transition-colors"
            >
              API documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 lg:px-8 py-14">
        <h2 className="text-2xl font-bold mb-2">Browse by category</h2>
        <p className="text-muted-foreground mb-8">Pick a category to explore all tools inside.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {registry.categories.map((category) => {
            const tools = registry.tools.filter((t) => t.category === category.id);
            const Icon = getCategoryIcon(category.icon);
            const colors = getCategoryColors(category.color);

            return (
              <Link
                key={category.id}
                href={`/tools/${category.slug}`}
                className="group relative rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Subtle bg tint on hover */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${colors.iconBg}`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("rounded-xl p-3", colors.iconBg)}>
                      <Icon className={cn("h-6 w-6", colors.iconText)} />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1.5">{category.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {category.description}
                  </p>
                  <span className={cn("inline-flex items-center rounded-lg px-2.5 py-1 text-sm font-medium", colors.badgeBg, colors.badgeText)}>
                    {tools.length} tool{tools.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
