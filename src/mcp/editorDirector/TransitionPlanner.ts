import type { RhythmAnalysis } from "./RhythmAnalyzer";
import type { ShotScore } from "./ShotRanking";

export type TransitionType = "cut" | "fade" | "cross dissolve" | "match cut" | "camera whip" | "flash transition";

export type TransitionDecision = {
  fromShot: string;
  toShot: string;
  transition: TransitionType;
  reason: string;
};

export function planTransitions(rhythm: RhythmAnalysis[], rankings: ShotScore[]): TransitionDecision[] {
  return rhythm.slice(0, -1).map((item, index) => {
    const next = rhythm[index + 1];
    const currentScore = rankings.find((rank) => rank.shotId === item.shotId)?.shotScore ?? 60;
    const transition: TransitionType =
      item.rhythm === "fast" && next.rhythm === "fast" ? "cut" :
      currentScore >= 85 ? "match cut" :
      item.rhythm === "slow" && next.rhythm === "slow" ? "cross dissolve" :
      next.rhythm === "fast" ? "camera whip" :
      index === rhythm.length - 2 ? "fade" :
      "cut";
    return {
      fromShot: item.shotId,
      toShot: next.shotId,
      transition,
      reason: transition === "match cut" ? "Preserve visual or emotional continuity across high-value shots." : transition === "camera whip" ? "Increase urgency without breaking spatial clarity." : transition === "cross dissolve" ? "Allow atmosphere and silence to bridge the cut." : transition === "fade" ? "Let the ending breathe." : "Invisible continuity cut."
    };
  });
}
