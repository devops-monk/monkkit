export interface TextDiffInput {
  left: string;
  right: string;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

export type LineType = "added" | "removed" | "unchanged" | "changed";

export interface WordSpan {
  type: "same" | "added" | "removed";
  text: string;
}

export interface DiffLine {
  type: LineType;
  leftLine: string | null;
  rightLine: string | null;
  leftNum: number | null;
  rightNum: number | null;
  leftSpans?: WordSpan[];
  rightSpans?: WordSpan[];
}

export interface TextDiffOutput {
  success: boolean;
  lines?: DiffLine[];
  error?: string;
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
}

function lcsTable(a: string[], b: string[]): number[][] {
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

function buildLineDiff(a: string[], b: string[], dp: number[][], i: number, j: number, lines: DiffLine[], leftNums: number[], rightNums: number[]): void {
  if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
    buildLineDiff(a, b, dp, i - 1, j - 1, lines, leftNums, rightNums);
    lines.push({ type: "unchanged", leftLine: a[i - 1], rightLine: b[j - 1], leftNum: leftNums[i - 1], rightNum: rightNums[j - 1] });
  } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    buildLineDiff(a, b, dp, i, j - 1, lines, leftNums, rightNums);
    lines.push({ type: "added", leftLine: null, rightLine: b[j - 1], leftNum: null, rightNum: rightNums[j - 1] });
  } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
    buildLineDiff(a, b, dp, i - 1, j, lines, leftNums, rightNums);
    lines.push({ type: "removed", leftLine: a[i - 1], rightLine: null, leftNum: leftNums[i - 1], rightNum: null });
  }
}

// Tokenize a line into words and non-word separators so spaces are preserved
function tokenize(s: string): string[] {
  return s.match(/\S+|\s+/g) ?? (s === "" ? [""] : [s]);
}

function intraLineDiff(left: string, right: string): { leftSpans: WordSpan[]; rightSpans: WordSpan[] } {
  const a = tokenize(left);
  const b = tokenize(right);
  const dp = lcsTable(a, b);

  const leftSpans: WordSpan[] = [];
  const rightSpans: WordSpan[] = [];

  let i = a.length;
  let j = b.length;
  const ops: Array<{ op: "same" | "left" | "right"; a?: string; b?: string }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ op: "same", a: a[i - 1], b: b[j - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ op: "right", b: b[j - 1] });
      j--;
    } else {
      ops.push({ op: "left", a: a[i - 1] });
      i--;
    }
  }

  ops.reverse().forEach(({ op, a: at, b: bt }) => {
    if (op === "same") {
      leftSpans.push({ type: "same", text: at! });
      rightSpans.push({ type: "same", text: bt! });
    } else if (op === "left") {
      leftSpans.push({ type: "removed", text: at! });
    } else {
      rightSpans.push({ type: "added", text: bt! });
    }
  });

  return { leftSpans, rightSpans };
}

// Pair up consecutive removed+added lines as "changed" with intra-line word diffs
function pairChangedLines(lines: DiffLine[]): DiffLine[] {
  const result: DiffLine[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].type === "removed" && i + 1 < lines.length && lines[i + 1].type === "added") {
      const rem = lines[i];
      const add = lines[i + 1];
      const { leftSpans, rightSpans } = intraLineDiff(rem.leftLine ?? "", add.rightLine ?? "");
      result.push({
        type: "changed",
        leftLine: rem.leftLine,
        rightLine: add.rightLine,
        leftNum: rem.leftNum,
        rightNum: add.rightNum,
        leftSpans,
        rightSpans,
      });
      i += 2;
    } else {
      result.push(lines[i]);
      i++;
    }
  }
  return result;
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

  const dp = lcsTable(leftNorm, rightNorm);
  const rawLines: DiffLine[] = [];
  buildLineDiff(leftNorm, rightNorm, dp, leftLines.length, rightLines.length, rawLines, leftNums, rightNums);

  // Restore original (non-normalized) line text
  const restored: DiffLine[] = rawLines.map((l) => ({
    ...l,
    leftLine: l.leftNum != null ? leftLines[l.leftNum - 1] : null,
    rightLine: l.rightNum != null ? rightLines[l.rightNum - 1] : null,
  }));

  const diffLines = pairChangedLines(restored);

  const addedCount = diffLines.filter((l) => l.type === "added" || l.type === "changed").length;
  const removedCount = diffLines.filter((l) => l.type === "removed" || l.type === "changed").length;
  const unchangedCount = diffLines.filter((l) => l.type === "unchanged").length;

  return { success: true, lines: diffLines, addedCount, removedCount, unchangedCount };
}
