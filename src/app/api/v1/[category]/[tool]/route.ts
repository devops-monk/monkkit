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

  // 4. Check rate limit (per account, not per key)
  const allowed = await checkRateLimit(keyRecord.id, keyRecord.userId, toolDef.id);
  if (!allowed) {
    return Response.json(
      { error: "Daily rate limit exceeded (100 req/day per account). Resets at midnight UTC." },
      { status: 429 }
    );
  }

  // 5. Parse body
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Inject client IP for tools that need it (e.g. my-ip)
  const clientIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;
  if (clientIp) body = { ...body, _clientIp: clientIp };

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
