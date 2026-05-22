import Link from "next/link";
import { ExternalLink, Coffee, GitBranch, ArrowRight, Wrench, Zap, Globe } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { registry } from "@/registry";

export const metadata = { title: "About | MonkKit" };

const BUY_COFFEE_URL = "https://buymeacoffee.com/abhi15sep";

export default function AboutPage() {
  const totalTools = registry.tools.length;
  const totalCategories = registry.categories.length;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />

      <main className="flex-1">

        {/* Hero — author card */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/8 via-background to-background">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, oklch(0.535 0.233 264 / 0.25) 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative max-w-3xl mx-auto px-4 lg:px-8 py-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-primary/20 to-violet-500/20 border-2 border-primary/20 flex items-center justify-center text-5xl shadow-xl">
                  🧘
                </div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
                  <div className="h-3 w-3 rounded-full bg-white" />
                </div>
              </div>

              {/* Name + bio */}
              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-sm font-medium text-primary mb-3">
                  <Zap className="h-3.5 w-3.5" fill="currentColor" />
                  Open to DevOps consulting
                </div>
                <h1 className="text-4xl font-extrabold mb-2">Abhay Pratap Singh</h1>
                <p className="text-lg text-muted-foreground font-medium mb-4">
                  DevOps Engineer · Builder · Open-source enthusiast
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {["Kubernetes", "CI/CD", "Terraform", "Next.js", "TypeScript"].map((tag) => (
                    <span key={tag} className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-12 flex flex-col gap-10">

          {/* Story */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Why I built MonkKit</h2>
            <div className="prose prose-base dark:prose-invert max-w-none space-y-4">
              <p className="text-muted-foreground leading-relaxed text-base">
                Hey! I&apos;m Abhay — a DevOps engineer who spends a lot of time wrangling JSON, YAML, and configs.
                I built MonkKit because I was tired of bouncing between a dozen different sites just to format JSON
                or decode a JWT. Everything is in one place, works instantly in your browser, and will always be free.
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                MonkKit is a side project I build and maintain in my spare time. If it saves you even a few minutes
                a week, consider buying me a coffee — it keeps the server running and motivates me to keep adding tools.
              </p>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-3 gap-4">
            {[
              { value: totalTools.toString(), label: "Free tools", icon: Wrench, color: "text-primary bg-primary/10" },
              { value: totalCategories.toString(), label: "Categories", icon: Globe, color: "text-violet-600 bg-violet-500/10" },
              { value: "∞", label: "Always free", icon: Zap, color: "text-amber-600 bg-amber-500/10" },
            ].map(({ value, label, icon: Icon, color }) => (
              <div key={label} className="rounded-2xl border border-border bg-card p-5 text-center">
                <div className={`h-10 w-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-extrabold mb-0.5">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </section>

          {/* Links */}
          <section>
            <h2 className="text-2xl font-bold mb-4">Connect</h2>
            <div className="flex flex-col gap-3">
              <a
                href={BUY_COFFEE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-500/8 to-amber-500/5 px-6 py-5 hover:border-yellow-500/50 hover:from-yellow-500/12 transition-all"
              >
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-yellow-500/15 flex items-center justify-center text-2xl">
                  ☕
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">Buy me a coffee</p>
                  <p className="text-sm text-muted-foreground">Support MonkKit development — helps cover hosting costs</p>
                </div>
                <div className="shrink-0 flex items-center gap-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 px-4 py-2 text-sm font-bold text-yellow-950 transition-colors">
                  Support <ExternalLink className="h-3.5 w-3.5" />
                </div>
              </a>

              <a
                href="https://github.com/abhi15sep"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-muted flex items-center justify-center">
                  <GitBranch className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">GitHub</p>
                  <p className="text-sm text-muted-foreground">github.com/abhi15sep</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>

              <a
                href="https://devops-monk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">
                  🧘
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base">DevOps Monk</p>
                  <p className="text-sm text-muted-foreground">devops-monk.com — blog & projects</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </a>
            </div>
          </section>

          {/* MonkKit CTA */}
          <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-background p-8 text-center">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-primary" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Ready to explore MonkKit?</h2>
            <p className="text-muted-foreground mb-6 text-base">
              {totalTools} free tools across {totalCategories} categories — no account needed to use the browser tools.
              API access is free with a sign-in.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
              >
                Browse all tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/api"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-base font-semibold hover:bg-muted/50 transition-colors"
              >
                API reference
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-base font-semibold hover:bg-muted/50 transition-colors"
              >
                Get API key
              </Link>
            </div>
          </section>

        </div>
      </main>

      <AppFooter />
    </div>
  );
}
