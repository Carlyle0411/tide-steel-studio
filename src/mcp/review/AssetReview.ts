import type { ReviewLevel, ReviewRuleResult } from "./ReviewRules";
import { reviewPromptAgainstRules } from "./ReviewRules";

export type AssetReviewResult = {
  result: ReviewLevel;
  checks: ReviewRuleResult[];
};

export function reviewGeneratedAsset(input: { prompt: string; hasImageOutput: boolean; consistencyPassed?: boolean }): AssetReviewResult {
  const checks = reviewPromptAgainstRules(input.prompt);
  checks.push({
    area: "quality",
    level: input.hasImageOutput ? "PASS" : "FAIL",
    message: input.hasImageOutput ? "Generated image output exists." : "No real image output exists."
  });
  if (input.consistencyPassed === false) {
    checks.push({ area: "character", level: "FAIL", message: "Consistency check failed." });
  }
  const result: ReviewLevel = checks.some((check) => check.level === "FAIL") ? "FAIL" : checks.some((check) => check.level === "WARNING") ? "WARNING" : "PASS";
  return { result, checks };
}
