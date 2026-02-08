import linkedin from "./linkedin.js";
import indeed from "./indeed.js";
import generic from "./generic.js";

export function getExtractor(host) {

  if (host.includes("linkedin")) return linkedin;

  if (host.includes("indeed")) return indeed;

  return generic;
}
