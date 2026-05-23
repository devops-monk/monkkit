import { NextRequest } from "next/server";
import { validateApiKey } from "@/lib/api-key";
import { checkRateLimit } from "@/lib/rate-limit";
import { getToolBySlug } from "@/registry";

function extractBearer(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  return auth.slice(7).trim() || null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ category: string; tool: string }> }
) {
  const { category, tool: toolSlug } = await params;

  // 1. Validate API key
  const rawKey = extractBearer(req);
  if (!rawKey) {
    return Response.json(
      { error: "Missing Authorization header. Use: Authorization: Bearer <api-key>" },
      { status: 401 }
    );
  }
  const keyRecord = await validateApiKey(rawKey);
  if (!keyRecord) {
    return Response.json({ error: "Invalid API key" }, { status: 401 });
  }

  // 2. Check category permission
  const allowedCategories = keyRecord.permissions.map((p) => p.category);
  if (!allowedCategories.includes(category)) {
    return Response.json(
      {
        error: `This API key does not have permission to access the '${category}' category.`,
        allowedCategories,
      },
      { status: 403 }
    );
  }

  // 3. Find tool
  const toolDef = getToolBySlug(category, toolSlug);
  if (!toolDef) {
    return Response.json(
      { error: `Tool not found: ${category}/${toolSlug}` },
      { status: 404 }
    );
  }

  // 4. Check rate limit
  const allowed = await checkRateLimit(keyRecord.id, toolDef.id);
  if (!allowed) {
    return Response.json(
      { error: "Daily rate limit exceeded (100 req/day). Resets at midnight UTC." },
      { status: 429 }
    );
  }

  // 5. Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 6. Call the process function registered on the tool definition
  try {
    const result = await Promise.resolve(toolDef.process(body));
    return Response.json({ success: true, tool: toolDef.id, result });
  } catch (err) {
    return Response.json(
      { error: "Tool execution failed", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
