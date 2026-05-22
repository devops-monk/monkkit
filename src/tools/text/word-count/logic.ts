export interface WordCountInput {
  input: string;
}

export interface WordCountStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  uniqueWords: number;
  avgWordLength: number;
  readingTimeMin: number;
}

export interface WordCountOutput {
  success: boolean;
  stats?: WordCountStats;
  error?: string;
}

export function process(params: unknown): WordCountOutput {
  const { input } = params as WordCountInput;
  if (!input) return { success: false, error: "Input is empty" };
  const words = input.match(/\b\w+\b/g) ?? [];
  const sentences = input.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const paragraphs = input.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
  const avgWordLength = words.length > 0 ? words.reduce((sum, w) => sum + w.length, 0) / words.length : 0;
  return {
    success: true,
    stats: {
      characters: input.length,
      charactersNoSpaces: input.replace(/\s/g, "").length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      lines: input.split("\n").length,
      uniqueWords,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      readingTimeMin: Math.ceil(words.length / 200),
    }
  };
}
