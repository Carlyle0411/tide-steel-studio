import type { TimelineNode } from "../timeline/EpisodeTimeline";

export type ShotScore = {
  shotId: string;
  storyImportance: number;
  visualQuality: number;
  characterContinuity: number;
  emotionImpact: number;
  actionClarity: number;
  shotScore: number;
  recommendation: "keep" | "hold_longer" | "trim" | "review";
  reason: string;
};

export function rankShots(nodes: TimelineNode[]): ShotScore[] {
  return nodes.map((node, index) => {
    const storyImportance = index === 0 || index === nodes.length - 1 ? 92 : 60 + (index % 4) * 8;
    const visualQuality = node.image || node.video ? 82 : 55;
    const characterContinuity = node.video ? 78 : 62;
    const emotionImpact = index > nodes.length * 0.65 ? 85 : 50 + (index % 5) * 7;
    const actionClarity = index < 4 ? 58 : 70 + (index % 3) * 6;
    const shotScore = Math.round(storyImportance * 0.3 + visualQuality * 0.2 + characterContinuity * 0.18 + emotionImpact * 0.2 + actionClarity * 0.12);
    const recommendation = shotScore >= 82 ? "hold_longer" : shotScore >= 68 ? "keep" : visualQuality < 60 ? "review" : "trim";
    return {
      shotId: node.shotId,
      storyImportance,
      visualQuality,
      characterContinuity,
      emotionImpact,
      actionClarity,
      shotScore,
      recommendation,
      reason: recommendation === "review" ? "Missing generated/approved visual asset; do not remove, send to review." : recommendation === "hold_longer" ? "High story or emotion value; cut late." : recommendation === "trim" ? "Keep the beat but reduce duration if continuity remains clear." : "Maintain original placement."
    };
  });
}
