import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { Badge } from "@/components/ui/badge";
import { registry } from "@/registry";
import { getCategoryIcon } from "@/lib/category-icons";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 px-4 lg:px-8 py-16">
        {/* Hero */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight mb-5">
            Free Developer Tools
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Every tool you need, in one place. No login, no ads, no nonsense.
            Built by a DevOps engineer for developers.
          </p>
        </div>

        {/* Categories grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {registry.categories.map((category) => {
            const tools = registry.tools.filter((t) => t.category === category.id);
            const Icon = getCategoryIcon(category.icon);

            return (
              <Link
                key={category.id}
                href={`/tools/${category.slug}`}
                className="group rounded-xl border border-border/50 bg-card p-6 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <h2 className="text-lg font-semibold mb-1.5">{category.name}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {category.description}
                </p>
                <Badge variant="secondary" className="text-sm px-2.5 py-0.5">
                  {tools.length} tool{tools.length !== 1 ? "s" : ""}
                </Badge>
              </Link>
            );
          })}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
