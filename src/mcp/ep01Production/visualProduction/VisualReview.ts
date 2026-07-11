import type { ReviewQueueItem } from "../../review/ReviewQueue";

export type VisualQualityScore = {
  composition: number;
  lighting: number;
  characterSimilarity: number;
  worldConsistency: number;
  cinematicLevel: number;
  total: number;
  canEnterVideo: boolean;
  notes: string[];
};

export function scoreVisualQuality(item: Pick<ReviewQueueItem, "assetVersion" | "prompt" | "tool">): VisualQualityScore {
  const prompt = item.prompt.toLowerCase();
  const composition = prompt.includes("cinematic") || prompt.includes("24mm") || prompt.includes("50mm") ? 88 : 72;
  const lighting = prompt.includes("lighting") || prompt.includes("cold") || prompt.includes("blue") ? 86 : 70;
  const characterSimilarity = prompt.includes("character lock") || prompt.includes("same person") ? 86 : prompt.includes("chen mu") ? 82 : 75;
  const worldConsistency = prompt.includes("hangzhou") || prompt.includes("deep blue") || prompt.includes("crt") || prompt.includes("white tide") ? 90 : 76;
  const cinematicLevel = prompt.includes("game") || prompt.includes("anime") ? 45 : 88;
  const total = Math.round((composition + lighting + characterSimilarity + worldConsistency + cinematicLevel) / 5);
  const notes = [
    total < 85 ? "Score below 85; cannot enter video stage." : "Score is eligible for video stage after human approval.",
    item.assetVersion.status === "waiting_review" ? "Still requires human visual review." : `Asset status: ${item.assetVersion.status}.`
  ];
  return {
    composition,
    lighting,
    characterSimilarity,
    worldConsistency,
    cinematicLevel,
    total,
    canEnterVideo: total >= 85 && item.assetVersion.status === "approved",
    notes
  };
}
