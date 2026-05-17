import type { ToolDefinition } from "@/types/registry";

export const passwordTool: ToolDefinition = {
  id: "generators-password",
  slug: "password-generator",
  name: "Password Generator",
  shortDescription: "Generate secure, random passwords with custom rules.",
  description:
    "Generate cryptographically secure passwords using crypto.getRandomValues. Control length, character sets (uppercase, lowercase, numbers, symbols), exclude ambiguous characters, and generate multiple passwords at once. Includes a password strength indicator with entropy calculation.",
  category: "generators",
  tags: ["password", "generator", "security", "random", "secure"],
  keywords: ["password generator", "random password", "secure password maker", "strong password generator"],
  icon: "KeyRound",
  status: "new",
  component: () => import("@/tools/generators/password"),
  process: (input) => import("@/tools/generators/password/logic").then((m) => Promise.resolve(m.process(input as Parameters<typeof m.process>[0]))),
};