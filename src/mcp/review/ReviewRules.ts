export type ReviewLevel = "PASS" | "WARNING" | "FAIL";

export type ReviewRuleResult = {
  area: "character" | "mecha" | "scene" | "quality" | "cinematic";
  level: ReviewLevel;
  message: string;
};

export function reviewPromptAgainstRules(prompt: string): ReviewRuleResult[] {
  const lower = prompt.toLowerCase();
  const results: ReviewRuleResult[] = [];
  results.push({
    area: "cinematic",
    level: /cinematic|imax|film/.test(lower) ? "PASS" : "WARNING",
    message: "Prompt should preserve cinematic film language."
  });
  results.push({
    area: "quality",
    level: /anime|cartoon|game render|low quality/.test(lower) ? "PASS" : "WARNING",
    message: "Negative prompt should explicitly block anime/cartoon/game render/low quality."
  });
  if (/陈牧|chen mu/i.test(prompt)) {
    results.push({ area: "character", level: /same facial structure|same person/.test(lower) ? "PASS" : "WARNING", message: "Character continuity requires same face, age, hair and costume lock." });
  }
  if (/赤霆|crt|red thunder/i.test(prompt)) {
    results.push({ area: "mecha", level: /dark red|black mechanical|blue/.test(lower) ? "PASS" : "WARNING", message: "Mecha continuity requires red/black armor and blue sync light." });
  }
  if (/杭州湾|hangzhou bay|deep blue/i.test(prompt)) {
    results.push({ area: "scene", level: /wet|storm|industrial|ocean/.test(lower) ? "PASS" : "WARNING", message: "Scene continuity requires wet industrial ocean-future language." });
  }
  return results;
}
