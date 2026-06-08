export interface TextDiffInput {
  left: string;
  right: string;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

export type LineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: LineType;
  leftLine: string | null;
  rightLine: string | null;
  leftNum: number | null;
  rightNum: number | null;
}

export interface TextDiffOutput {
  success: boolean;
  lines?: DiffLine[];
  error?: string;
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
}

function lcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function buildDiff(a: string[], b: string[], dp: number[][], i: number, j: number, lines: DiffLine[], leftNums: number[], rightNums: number[]): void {
  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    buildDiff(a, b, dp, i - 1, j - 1, lines, leftNums, rightNums);
    lines.push({ type: "unchanged", leftLine: a[i - 1], rightLine: b[j - 1], leftNum: leftNums[i - 1], rightNum: rightNums[j - 1] });
  } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    buildDiff(a, b, dp, i, j - 1, lines, leftNums, rightNums);
    lines.push({ type: "added", leftLine: null, rightLine: b[j - 1], leftNum: null, rightNum: rightNums[j - 1] });
  } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
    buildDiff(a, b, dp, i - 1, j, lines, leftNums, rightNums);
    lines.push({ type: "removed", leftLine: a[i - 1], rightLine: null, leftNum: leftNums[i - 1], rightNum: null });
  }
}

export function process(params: unknown): TextDiffOutput {
  const { left, right, ignoreWhitespace = false, ignoreCase = false } = params as TextDiffInput;

  if (left === undefined || right === undefined) {
    return { success: false, error: "Both inputs are required", addedCount: 0, removedCount: 0, unchangedCount: 0 };
  }

  const normalize = (s: string) => {
    let r = s;
    if (ignoreWhitespace) r = r.trim().replace(/\s+/g, " ");
    if (ignoreCase) r = r.toLowerCase();
    return r;
  };

  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  const leftNorm = leftLines.map(normalize);
  const rightNorm = rightLines.map(normalize);
  const leftNums = leftLines.map((_, i) => i + 1);
  const rightNums = rightLines.map((_, i) => i + 1);

  const dp = lcs(leftNorm, rightNorm);
  const lines: DiffLine[] = [];
  buildDiff(leftNorm, rightNorm, dp, leftLines.length, rightLines.length, lines, leftNums, rightNums);

  // Replace normalized lines with original for display
  const diffLines: DiffLine[] = lines.map((l) => ({
    ...l,
    leftLine: l.leftNum != null ? leftLines[l.leftNum - 1] : null,
    rightLine: l.rightNum != null ? rightLines[l.rightNum - 1] : null,
  }));

  const addedCount = diffLines.filter((l) => l.type === "added").length;
  const removedCount = diffLines.filter((l) => l.type === "removed").length;
  const unchangedCount = diffLines.filter((l) => l.type === "unchanged").length;

  return { success: true, lines: diffLines, addedCount, removedCount, unchangedCount };
}