import type { EpisodePlan } from "./EpisodePlanner";

export type EpisodeValidationResult = {
  ok: boolean;
  reasons: string[];
};

export class EpisodeValidator {
  validatePlan(plan: EpisodePlan): EpisodeValidationResult {
    const reasons: string[] = [];
    if (!plan.episodeId) reasons.push("episodeId is required.");
    if (!plan.shots.length) reasons.push("Episode has no parsed shots.");
    const duplicated = new Set<string>();
    const seen = new Set<string>();
    plan.shots.forEach((shot) => {
      if (seen.has(shot.shotId)) duplicated.add(shot.shotId);
      seen.add(shot.shotId);
    });
    if (duplicated.size) reasons.push(`Duplicated shot IDs: ${Array.from(duplicated).join(", ")}`);
    return { ok: reasons.length === 0, reasons };
  }
}

export const episodeValidator = new EpisodeValidator();
