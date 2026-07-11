import type { ProductionImageAsset } from "../../pages/production/types";
import type { FinalEditDecision } from "../editorDirector/EditorAgent";

export type QualityReport = {
  episodeId: string;
  imageQuality: number;
  videoQuality: number;
  characterContinuity: number;
  storyConsistency: number;
  emotionImpact: number;
  qualityScore: number;
  notes: string[];
};

export function generateQualityReport(episodeId: string, approvedImages: ProductionImageAsset[], editDecision: FinalEditDecision): QualityReport {
  const imageQuality = Math.min(95, 55 + approvedImages.length * 8);
  const videoQuality = 25;
  const characterContinuity = approvedImages.some((image) => image.reference.includes("REFERENCE_01")) ? 70 : 45;
  const storyConsistency = editDecision.sourceShotCount === 18 ? 82 : 60;
  const emotionImpact = Math.round(editDecision.emotionCurve.reduce((sum, point) => sum + point.intensity, 0) / editDecision.emotionCurve.length);
  const qualityScore = Math.round(imageQuality * 0.22 + videoQuality * 0.18 + characterContinuity * 0.2 + storyConsistency * 0.22 + emotionImpact * 0.18);

  return {
    episodeId,
    imageQuality,
    videoQuality,
    characterContinuity,
    storyConsistency,
    emotionImpact,
    qualityScore,
    notes: [
      "Image foundation is usable for EP01 batch testing.",
      "Video quality remains low until real provider output enters review.",
      "Character continuity depends on locked references before face-heavy shots.",
      "Emotion curve exists, but final impact depends on approved edit and sound."
    ]
  };
}
