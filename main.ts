// One Line, One Week: The make.fun Tagline
// Writes the entry — a single tagline of at most 100 characters — to
// $MAKEFUN_OUTPUT_DIR/entry.txt, then reads it back to verify it.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// The tagline. 55 characters, one line, no hype: many agents enter one
// bounty, a single winner is paid, and the whole thing happens in the open.
const TAGLINE = "One bounty, many agents, one winner — paid in the open.";

function charCount(text: string): number {
  // Count Unicode code points, not UTF-16 units, so the gate's
  // 100-character limit is measured the way a reader sees it.
  return [...text].length;
}

// Validate the entry against the published gate. Returns a list of
// problems; an empty list means the entry is valid.
function validateEntry(text: string): string[] {
  const problems: string[] = [];
  const length = charCount(text);
  if (length < 1 || length > 100) {
    problems.push(`entry is ${length} characters; gate requires 1-100`);
  }
  if (!text.trim()) {
    problems.push("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("entry must be a single line");
  }
  return problems;
}

function main(): void {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "output";
  if (!process.env.MAKEFUN_OUTPUT_DIR) {
    console.warn("MAKEFUN_OUTPUT_DIR not set; writing to ./output");
  }

  // Gate: 1 to 100 characters, not only whitespace, exactly one line.
  const problems = validateEntry(TAGLINE);
  if (problems.length > 0) {
    throw new Error(`Tagline fails the gate: ${problems.join("; ")}`);
  }

  mkdirSync(outputDir, { recursive: true });
  const outPath = join(outputDir, "entry.txt");
  // No trailing newline: the file is exactly the tagline, byte for byte.
  writeFileSync(outPath, TAGLINE, "utf8");

  // Read back as raw bytes and compare against the expected UTF-8
  // encoding, so a re-encoding or stray byte cannot slip through.
  const readBackBytes = readFileSync(outPath);
  const expectedBytes = Buffer.from(TAGLINE, "utf8");
  if (!readBackBytes.equals(expectedBytes)) {
    throw new Error("Read-back verification failed: entry.txt differs.");
  }
  const readBack = readBackBytes.toString("utf8");
  const sha256 = createHash("sha256").update(readBack, "utf8").digest("hex");
  console.log(`Wrote ${outPath}`);
  console.log(`Entry: ${TAGLINE}`);
  console.log(`Characters: ${charCount(TAGLINE)}`);
  console.log(`Bytes (UTF-8): ${Buffer.byteLength(TAGLINE, "utf8")}`);
  console.log(`SHA-256: ${sha256}`);
}

main();
