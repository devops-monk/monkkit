import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllToolSlugs, getToolBySlug } from "@/registry";
import { ToolShell } from "@/components/tool-ui/ToolShell";
import { ToolRenderer } from "@/components/tool-ui/ToolRenderer";

export async function generateStaticParams() {
  return getAllToolSlugs().map(({ category, tool }) => ({ category, tool }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}): Promise<Metadata> {
  const { category, tool } = await params;
  const t = getToolBySlug(category, tool);
  if (!t) return {};
  return {
    title: `${t.name} | MonkKit`,
    description: t.description,
    keywords: t.keywords,
    openGraph: {
      title: t.name,
      description: t.shortDescription,
      url: `https://tools.devops-monk.com/tools/${category}/${tool}`,
      siteName: "MonkKit",
      type: "website",
    },
    alternates: {
      canonical: `https://tools.devops-monk.com/tools/${category}/${tool}`,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ category: string; tool: string }>;
}) {
  const { category, tool } = await params;
  const toolDef = getToolBySlug(category, tool);
  if (!toolDef) notFound();

  // Strip non-serializable fields before passing to client component
  const { component: _c, process: _p, ...meta } = toolDef;

  return (
    <ToolShell meta={meta}>
      <ToolRenderer category={category} slug={tool} />
    </ToolShell>
  );
}
