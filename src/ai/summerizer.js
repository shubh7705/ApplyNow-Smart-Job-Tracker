import { normalizeText, truncate } from "../utils/helpers.js";

export async function summarizeJD(text = "") {
  const normalized = normalizeText(text);
  if (!normalized) {
    return { summary: "No description available.", keywords: [] };
  }

  const sentences = text
    .replace(/\s+/g, " ")
    .split(/[.!?]\s+/)
    .filter(Boolean);

  const summary = sentences.length ? truncate(sentences.slice(0, 3).join(". "), 420) : truncate(text, 420);

  const tokens = normalized.split(" ");
  const frequency = new Map();
  tokens.forEach((token) => {
    if (token.length < 3) return;
    frequency.set(token, (frequency.get(token) || 0) + 1);
  });

  const keywords = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  return { summary, keywords };
}
