import type { TimelineNode } from "../timeline/EpisodeTimeline";
import type { EmotionPoint } from "./EmotionCurve";
import type { RhythmAnalysis } from "./RhythmAnalyzer";
import type { ShotScore } from "./ShotRanking";
import type { TransitionDecision } from "./TransitionPlanner";

export type EditDecision = {
  shotId: string;
  order: number;
  cutPoint: string;
  transition: string;
  bgmStart?: string;
  sfxPosition?: string;
  subtitleTiming?: string;
  action: "keep" | "trim" | "hold" | "review";
  reason: string;
};

export type TimelineEditPlan = {
  episodeId: string;
  shotCount: number;
  decisions: EditDecision[];
  musicRecommendation: string;
  subtitleCheck: "pass" | "needs_script";
  protectedOriginalAssets: true;
};

export function createEditPlan(input: {
  episodeId: string;
  nodes: TimelineNode[];
  rhythm: RhythmAnalysis[];
  emotionCurve: EmotionPoint[];
  rankings: ShotScore[];
  transitions: TransitionDecision[];
}): TimelineEditPlan {
  const decisions = input.nodes.map((node, index) => {
    const rank = input.rankings.find((item) => item.shotId === node.shotId);
    const rhythm = input.rhythm.find((item) => item.shotId === node.shotId);
    const transition = input.transitions.find((item) => item.fromShot === node.shotId)?.transition ?? "fade";
    const action = rank?.recommendation === "hold_longer" ? "hold" : rank?.recommendation === "trim" ? "trim" : rank?.recommendation === "review" ? "review" : "keep";
    return {
      shotId: node.shotId,
      order: index + 1,
      cutPoint: rhythm?.rhythm === "fast" ? "cut on completed action" : rhythm?.rhythm === "medium" ? "cut after spatial read" : "cut after emotional beat",
      transition,
      bgmStart: index === 0 ? "00:00 - no music, low-frequency room tone only" : index === 6 ? "soft drone enters under pressure" : undefined,
      sfxPosition: rhythm?.actionIntensity && rhythm.actionIntensity > 65 ? "sync SFX to physical consequence" : "environment bed",
      subtitleTiming: "hold subtitles inside shot, never across unknown reveal",
      action,
      reason: rank?.reason ?? "Maintain original timeline order."
    };
  });

  return {
    episodeId: input.episodeId,
    shotCount: input.nodes.length,
    decisions,
    musicRecommendation: "Begin with silence and low-frequency ocean tone; delay score until the human decision becomes irreversible.",
    subtitleCheck: "needs_script",
    protectedOriginalAssets: true
  };
}
