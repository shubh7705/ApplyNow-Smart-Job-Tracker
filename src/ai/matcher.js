import { cosineSimilarity, vectorize } from "../utils/helpers.js";

export function matchSkills(jd, skills) {
  const jdVec = vectorize(jd);
  const skillVec = vectorize(skills);
  return cosineSimilarity(jdVec, skillVec);
}
