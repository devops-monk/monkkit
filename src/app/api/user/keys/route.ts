import { auth } from "@/lib/auth";
import { getUserApiKeys } from "@/lib/api-key";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await getUserApiKeys(session.user.id);
  return Response.json({
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      key: k.key,
      createdAt: k.createdAt,
      lastUsed: k.lastUsed,
      permissions: k.permissions.map((p) => p.category),
    })),
  });
}
