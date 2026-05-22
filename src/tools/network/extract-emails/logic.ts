export interface ExtractEmailsInput {
  input: string;
  unique?: boolean;
}

export interface ExtractEmailsOutput {
  success: boolean;
  emails?: string[];
  count?: number;
  error?: string;
}

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

export function process(params: unknown): ExtractEmailsOutput {
  const { input, unique = true } = params as ExtractEmailsInput;
  if (!input?.trim()) return { success: false, error: "Input is empty" };
  let emails: string[] = input.match(EMAIL_RE) ?? [];
  if (unique) emails = [...new Set(emails)];
  return { success: true, emails, count: emails.length };
}
