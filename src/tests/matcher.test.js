import { matchSkills } from "../ai/matcher.js";

test("matches similar skills", () => {
  const score = matchSkills(
    "Python ML backend",
    "Python machine learning"
  );

  expect(score).toBeGreaterThan(0.6);
});
