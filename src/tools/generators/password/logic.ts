export interface PasswordInput {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  customSymbols: string;
  count: number;
}

export interface PasswordOutput {
  success: boolean;
  passwords: string[];
  strength: "weak" | "fair" | "good" | "strong";
  entropy: number;
  error?: string;
}

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  uppercase_safe: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  lowercase_safe: "abcdefghjkmnpqrstuvwxyz",
  numbers: "0123456789",
  numbers_safe: "23456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
};

function getEntropy(charsetSize: number, length: number): number {
  return Math.log2(Math.pow(charsetSize, length));
}

function getStrength(entropy: number): PasswordOutput["strength"] {
  if (entropy < 40) return "weak";
  if (entropy < 60) return "fair";
  if (entropy < 80) return "good";
  return "strong";
}

function generateOne(input: PasswordInput, charset: string): string {
  const array = new Uint32Array(input.length);
  crypto.getRandomValues(array);
  let password = Array.from(array).map((n) => charset[n % charset.length]).join("");

  // Guarantee at least one char from each selected set
  const sets: string[] = [];
  if (input.uppercase) sets.push(input.excludeAmbiguous ? CHARS.uppercase_safe : CHARS.uppercase);
  if (input.lowercase) sets.push(input.excludeAmbiguous ? CHARS.lowercase_safe : CHARS.lowercase);
  if (input.numbers) sets.push(input.excludeAmbiguous ? CHARS.numbers_safe : CHARS.numbers);
  if (input.symbols) sets.push(input.customSymbols || CHARS.symbols);

  const arr = password.split("");
  sets.forEach((set, i) => {
    const pos = i % input.length;
    const pick = new Uint32Array(1);
    crypto.getRandomValues(pick);
    arr[pos] = set[pick[0] % set.length];
  });

  // Shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = new Uint32Array(1);
    crypto.getRandomValues(j);
    const idx = j[0] % (i + 1);
    [arr[i], arr[idx]] = [arr[idx], arr[i]];
  }

  return arr.join("");
}

export function process(input: PasswordInput): PasswordOutput {
  let charset = "";
  if (input.uppercase) charset += input.excludeAmbiguous ? CHARS.uppercase_safe : CHARS.uppercase;
  if (input.lowercase) charset += input.excludeAmbiguous ? CHARS.lowercase_safe : CHARS.lowercase;
  if (input.numbers) charset += input.excludeAmbiguous ? CHARS.numbers_safe : CHARS.numbers;
  if (input.symbols) charset += input.customSymbols || CHARS.symbols;

  if (!charset) {
    return { success: false, passwords: [], strength: "weak", entropy: 0, error: "Select at least one character set." };
  }

  const entropy = getEntropy(charset.length, input.length);
  const passwords = Array.from({ length: input.count }, () => generateOne(input, charset));

  return { success: true, passwords, strength: getStrength(entropy), entropy: Math.round(entropy) };
}