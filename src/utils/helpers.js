const WORD_BREAK = /[^a-z0-9]+/g;

const SYNONYMS = {
  ml: "machine learning",
  ai: "artificial intelligence",
  js: "javascript",
  ts: "typescript",
  node: "nodejs",
  nodejs: "node js",
  devops: "dev ops"
};

export function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(WORD_BREAK, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text = "") {
  const normalized = normalizeText(text);
  const raw = normalized.length ? normalized.split(" ") : [];
  const expanded = [];

  raw.forEach((token) => {
    if (!token) return;
    const synonym = SYNONYMS[token];
    if (synonym) {
      expanded.push(...synonym.split(" "));
    }
    expanded.push(token);
  });

  return expanded.filter(Boolean);
}

export function vectorize(text = "") {
  const tokens = tokenize(text);
  const vector = new Map();

  tokens.forEach((token) => {
    vector.set(token, (vector.get(token) || 0) + 1);
  });

  return vector;
}

export function cosineSimilarity(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const keys = new Set([...vecA.keys(), ...vecB.keys()]);

  keys.forEach((key) => {
    const a = vecA.get(key) || 0;
    const b = vecB.get(key) || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  });

  if (!normA || !normB) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function formatDate(value) {
  if (!value) return "No deadline";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No deadline";
  return date.toLocaleDateString();
}

export function uid(prefix = "job") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function truncate(text = "", max = 140) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export function toSentenceCase(value = "") {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}
